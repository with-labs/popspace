import * as React from 'react';
import { animated, SpringValue, useSpring, to } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';
import { makeStyles } from '@material-ui/core';
import { useRoomViewport } from './RoomViewport';
import { useSelector } from 'react-redux';
import { actions } from './roomSlice';
import { useCoordinatedDispatch } from './CoordinatedDispatchProvider';
import { Vector2, Bounds } from '../../types/spatials';
import { addVectors, roundVector, subtractVectors, clamp } from '../../utils/math';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../state/store';
import { throttle } from 'lodash';
import { MIN_WIDGET_HEIGHT, MIN_WIDGET_WIDTH } from '../../constants/room';
import clsx from 'clsx';
import { AutoPan } from './AutoPan';

// the time slicing for throttling movement events being sent over the
// network. Setting this too high will make movement look laggy for peers,
// but doesn't affect the local experience.
const MOVE_THROTTLE_PERIOD = 50;

export interface IDraggableProps {
  /**
   * The ID of the RoomObject this component should render
   */
  id: string;
  /**
   * A render-prop which is passed a bind() function you must
   * call, then spread the returned value onto an element you want
   * to act as the "drag handle" for your widget.
   */
  children: React.ReactNode;
  /**
   * Optionally, provide a custom z-index for ordering the object
   */
  zIndex?: number;
  /**
   * For resizeable draggable items, this is the minimum width you can
   * resize them to.
   */
  minWidth?: number;
  /**
   * For resizeable draggable items, this is the minimum height you
   * can resize them to.
   */
  minHeight?: number;
  /**
   * For resizeable draggable items, this is the maximum width you
   * can resize them to
   */
  maxWidth?: number;
  /**
   * For resizeable draggable items, this is the maximum height you
   * can resize them to
   */
  maxHeight?: number;
  /**
   * Whether the item can be resized by the user, or if it computes
   * its own size based on contents
   */
  isResizable?: boolean;
}

const DRAGGABLE_SPRING = {
  mass: 0.1,
  tension: 700,
  friction: 20,
};

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    willChange: 'transform',
  },
  unmeasuredContentSizer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentSizer: {
    width: '100%',
    height: '100%',
  },
  unresizableContentSizer: {
    position: 'relative',
  },
});

export const DraggableContext = React.createContext<{
  dragHandleProps: ReactEventHandlers;
  resizeHandleProps: ReactEventHandlers;
  isDraggingAnimatedValue: SpringValue<boolean>;
  isResizingAnimatedValue: SpringValue<boolean>;
  disableResize: boolean;
}>({
  dragHandleProps: {},
  resizeHandleProps: {},
  isDraggingAnimatedValue: null as any,
  isResizingAnimatedValue: null as any,
  disableResize: false,
});

const stopPropagation = (ev: React.MouseEvent | React.PointerEvent | React.KeyboardEvent) => {
  ev.stopPropagation();
};

/**
 * A Draggable is a generic container for any element within a Room which
 * can be moved or resized. Wrap any other component in Draggable to make
 * it interactive. Pass `children` as a function which receives a bind()
 * function you should call, then pass the result directly to the draggable
 * portion of your widget.
 */
export const Draggable: React.FC<IDraggableProps> = ({
  id,
  children,
  zIndex = 0,
  minWidth = MIN_WIDGET_WIDTH,
  minHeight = MIN_WIDGET_HEIGHT,
  maxWidth,
  maxHeight,
  isResizable,
}) => {
  const styles = useStyles();

  // creating a memoized selector for position, this will hopefully
  // reduce re-rendering if the position hasn't changed - which is
  // really important if we don't want performance to be reduced
  // rapidly as we add more room objects.
  const positionSelector = React.useMemo(
    () =>
      createSelector(
        (state: RootState) => state.room.positions,
        (_: any, objectId: string) => objectId,
        (positions, objectId) =>
          positions[objectId] ?? {
            position: { x: 0, y: 0 },
            size: null,
          }
      ),
    []
  );
  const { position, size } = useSelector((state: RootState) => positionSelector(state, id));
  // if this Draggable is marked as user-resizable, but does not have
  // a measured size, we will immediately measure the natural size of the
  // contents.
  const needsRemeasure = isResizable && !size;
  const measuredWidth = size?.width || 0;
  const measuredHeight = size?.height || 0;

  // dispatcher for movement changes
  const coordinatedDispatch = useCoordinatedDispatch();
  const onMove = React.useCallback(
    throttle((newPosition: Vector2) => {
      coordinatedDispatch(
        actions.moveObject({
          id,
          position: newPosition,
        })
      );
    }, MOVE_THROTTLE_PERIOD),
    [coordinatedDispatch, id]
  );
  const onResize = React.useCallback(
    (newSize: Bounds | null) => {
      coordinatedDispatch(
        actions.resizeObject({
          id,
          size: newSize,
        })
      );
    },
    [coordinatedDispatch, id]
  );

  const viewport = useRoomViewport();

  // This spring gradually interpolates the object into its desired position
  // after a change. That change might happen because the user dragged it,
  // or a new position has come in from the server.
  const [{ x, y, width, height, grabbing, resizing }, set] = useSpring(() => ({
    // initial values
    x: position.x,
    y: position.y,
    width: measuredWidth,
    height: measuredHeight,
    grabbing: false,
    resizing: false,
    config: DRAGGABLE_SPRING,
  }));

  const [contentEl, contentRef] = React.useState<HTMLDivElement | null>(null);

  // handles remeasuring the component from its native size when the flag is set
  React.useEffect(() => {
    if (!contentEl || !needsRemeasure) return;

    // immediately remeasure
    const w = clamp(contentEl.clientWidth, minWidth, maxWidth);
    const h = clamp(contentEl.clientHeight, minHeight, maxHeight);
    onResize({
      width: w,
      height: h,
    });
  }, [contentEl, needsRemeasure, onResize, minHeight, minWidth, maxWidth, maxHeight]);

  // Update the spring when any of the monitored spatial values change
  React.useEffect(() => {
    // only update position from Redux if we are not dragging right now
    if (!grabbing.get()) {
      set({
        x: position.x,
        y: position.y,
        width: measuredWidth,
        height: measuredHeight,
      });
    }
  }, [position.x, position.y, measuredWidth, measuredHeight, set, grabbing]);

  const grabDisplacementRef = React.useRef<Vector2 | null>(null);

  // create a private instance of AutoPan to control the automatic panning behavior
  // that occurs as the user drags an item near the edge of the screen.
  const autoPan = React.useMemo(() => new AutoPan(viewport.pan), [viewport.pan]);
  // we subscribe to auto-pan events so we can update the position
  // of the object as the viewport moves
  const { toWorldCoordinate } = viewport;
  React.useEffect(() => {
    const handleAutoPan = ({ cursorPosition }: { cursorPosition: Vector2 }) => {
      // all we have to do to move the object as the screen auto-pans is re-trigger a
      // move event with the same cursor position - since the view itself has moved 'below' us,
      // the same cursor position produces the new world position.
      const worldPosition = toWorldCoordinate(cursorPosition, true);
      // report the movement after converting to world coordinates
      const finalPosition = roundVector(addVectors(worldPosition, grabDisplacementRef.current || { x: 0, y: 0 }));
      onMove(finalPosition);
      set(finalPosition);
    };
    autoPan.on('pan', handleAutoPan);
    return () => {
      autoPan.off('pan', handleAutoPan);
    };
  }, [autoPan, toWorldCoordinate, onMove, set]);

  // binds drag controls to the underlying element
  const bindDragHandle = useGesture(
    {
      onDrag: (state) => {
        // prevent a drag event from bubbling up to the canvas
        state.event?.stopPropagation();

        // convert to world position, clamping to room bounds
        const worldPosition = viewport.toWorldCoordinate(
          {
            x: state.xy[0],
            y: state.xy[1],
          },
          true
        );

        let displacement: Vector2;
        // if this is the first frame of a new drag
        if (state.first) {
          // capture the initial displacement between the cursor and the
          // object's center to add to each subsequent position
          grabDisplacementRef.current = subtractVectors(position, worldPosition);
          displacement = grabDisplacementRef.current;
        } else {
          // if it's not the first frame, use the memoized value from the previous frame
          displacement = grabDisplacementRef.current || { x: 0, y: 0 };
        }

        // report the movement after converting to world coordinates
        const finalPosition = roundVector(addVectors(worldPosition, displacement));
        // send to Redux and peers
        onMove(finalPosition);
        // update our local position immediately
        set({
          x: finalPosition.x,
          y: finalPosition.y,
        });

        autoPan.update({ x: state.xy[0], y: state.xy[1] });
      },
      onDragStart: (state) => {
        state.event?.stopPropagation();
        viewport.onObjectDragStart();
        set({ grabbing: true });
        autoPan.start({ x: state.xy[0], y: state.xy[1] });
      },
      onDragEnd: (state) => {
        state.event?.stopPropagation();
        viewport.onObjectDragEnd();
        set({ grabbing: false });
        autoPan.stop();
      },
    },
    {
      eventOptions: {
        capture: true,
      },
    }
  );

  const bindResizeHandle = useGesture(
    {
      onDrag: (state) => {
        state.event?.stopPropagation();
        // unlike movement, this only sends updates when the change is complete
        set({
          width: clamp(width.goal + state.delta[0] * 2, minWidth, maxWidth || Infinity),
          height: clamp(height.goal + state.delta[1] * 2, minHeight, maxHeight || Infinity),
        });
      },
      onDragStart: (state) => {
        state.event?.stopPropagation();
        viewport.onObjectDragStart();
        set({ resizing: true });
      },
      onDragEnd: (state) => {
        state.event?.stopPropagation();
        viewport.onObjectDragEnd();
        set({ resizing: false });
        onResize({
          width: width.goal,
          height: height.goal,
        });
      },
    },
    {
      eventOptions: { capture: true },
    }
  );

  return (
    <DraggableContext.Provider
      value={{
        dragHandleProps: bindDragHandle(),
        isDraggingAnimatedValue: grabbing,
        resizeHandleProps: bindResizeHandle(),
        isResizingAnimatedValue: resizing,
        disableResize: !isResizable,
      }}
    >
      <animated.div
        style={{
          transform: to(
            [x, y, width, height],
            (xv, yv, wv, hv) => `translate(${Math.round(xv)}px, ${Math.round(yv)}px) translate(-50%, -50%)`
          ),
          width: isResizable ? width : undefined,
          height: isResizable ? height : undefined,
          zIndex: zIndex as any,
          cursor: grabbing.to((isGrabbing) => (isGrabbing ? 'grab' : 'inherit')),
        }}
        className={styles.root}
        onMouseDown={stopPropagation}
        onMouseMove={stopPropagation}
        onMouseUp={stopPropagation}
        onPointerDown={stopPropagation}
        onPointerMove={stopPropagation}
        onPointerUp={stopPropagation}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
      >
        <div
          // Until the content has been measured (or re-measured), we render it in an absolute
          // positioned overflowing frame to try to estimate its innate size, which we will
          // use as the new explicit size of the draggable once measuring is complete
          className={clsx({
            [styles.contentSizer]: !needsRemeasure && isResizable,
            [styles.unmeasuredContentSizer]: needsRemeasure && isResizable,
            [styles.unresizableContentSizer]: !isResizable,
          })}
          // while we are measuring, because of word-wrapping and other css overflow rules,
          // we want to enforce at least the minimum sizes - otherwise text wraps and creates
          // a taller measurement than we would want
          style={{ minWidth, minHeight, maxWidth, maxHeight }}
          ref={contentRef}
        >
          {children}
        </div>
      </animated.div>
    </DraggableContext.Provider>
  );
};
