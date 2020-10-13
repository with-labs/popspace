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
import clsx from 'clsx';
import { MIN_WIDGET_HEIGHT, MIN_WIDGET_WIDTH } from '../../constants/room';

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
});

export const DraggableContext = React.createContext<{
  dragHandleProps: ReactEventHandlers;
  resizeHandleProps: ReactEventHandlers;
  isDraggingAnimatedValue: SpringValue<boolean>;
  isResizingAnimatedValue: SpringValue<boolean>;
}>({
  dragHandleProps: {},
  resizeHandleProps: {},
  isDraggingAnimatedValue: null as any,
  isResizingAnimatedValue: null as any,
});

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
  const measuredWidth = size?.width || 0;
  const measuredHeight = size?.height || 0;
  const hasBeenMeasured = !!size;

  // dispatcher for movement changes
  const coordinatedDispatch = useCoordinatedDispatch();
  const onMove = React.useCallback(
    (newPosition: Vector2) => {
      coordinatedDispatch(
        actions.moveObject({
          id,
          position: newPosition,
        })
      );
    },
    [coordinatedDispatch, id]
  );
  const onResize = React.useCallback(
    (newSize: Bounds) => {
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

  const contentRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      // on the first mount, we measure the size of the content and
      // set that as the initial size in state.
      if (el && !hasBeenMeasured) {
        const width = Math.max(minWidth, el.clientWidth);
        const height = Math.max(minHeight, el.clientHeight);
        coordinatedDispatch(
          actions.resizeObject({
            id,
            size: { width, height },
          })
        );
      }
    },
    [hasBeenMeasured, coordinatedDispatch, id, minWidth, minHeight]
  );

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

  // Update the spring when any of the monitored spatial values change
  React.useEffect(() => {
    set({
      x: position.x,
      y: position.y,
      width: measuredWidth,
      height: measuredHeight,
    });
  }, [position.x, position.y, measuredWidth, measuredHeight, set]);

  // binds drag controls to the underlying element
  const bindDragHandle = useGesture(
    {
      onDrag: (state) => {
        // prevent a drag event from bubbling up to the canvas
        state.event?.stopPropagation();

        // waiting to reference these properties until this handler is called,
        // just to be sure we have the latest stuff.
        const { toWorldCoordinate } = viewport;

        const worldPosition = toWorldCoordinate({
          x: state.xy[0],
          y: state.xy[1],
        });

        let displacement: Vector2;
        // if this is the first frame of a new drag
        if (state.first) {
          // capture the initial displacement between the cursor and the
          // object's center to add to each subsequent position
          displacement = subtractVectors(position, worldPosition);
        } else {
          // if it's not the first frame, use the memoized value from the previous frame
          displacement = state.memo || { x: 0, y: 0 };
        }

        // report the movement after converting to world coordinates
        onMove(roundVector(addVectors(worldPosition, displacement)));

        return displacement;
      },
      onDragStart: (state) => {
        state.event?.preventDefault();
        state.event?.stopPropagation();
        viewport.onObjectDragStart();
        set({ grabbing: true });
      },
      onDragEnd: (state) => {
        state.event?.preventDefault();
        state.event?.stopPropagation();
        viewport.onObjectDragEnd();
        set({ grabbing: false });
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
        state.event?.preventDefault();
        state.event?.stopPropagation();
        // unlike movement, this only sends updates when the change is complete
        set({
          width: clamp(width.goal + state.delta[0] * 2, minWidth, maxWidth || Infinity),
          height: clamp(height.goal + state.delta[1] * 2, minHeight, maxHeight || Infinity),
        });
      },
      onDragStart: (state) => {
        state.event?.preventDefault();
        state.event?.stopPropagation();
        viewport.onObjectDragStart();
        set({ resizing: true });
      },
      onDragEnd: (state) => {
        state.event?.preventDefault();
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
      }}
    >
      <animated.div
        style={{
          transform: to(
            [x, y, width, height],
            (xv, yv, wv, hv) => `translate(${Math.round(xv - wv / 2)}px, ${Math.round(yv - hv / 2)}px)`
          ),
          width,
          height,
          zIndex: zIndex as any,
          cursor: grabbing.to((isGrabbing) => (isGrabbing ? 'grab' : 'inherit')),
        }}
        className={styles.root}
      >
        <div
          // Until the content has been measured (or re-measured), we render it in an absolute
          // positioned overflowing frame to try to estimate its innate size, which we will
          // use as the new explicit size of the draggable once measuring is complete
          className={clsx(hasBeenMeasured ? styles.contentSizer : styles.unmeasuredContentSizer)}
          // while we are measuring, because of word-wrapping and other css overflow rules,
          // we want to enforce at least the minimum sizes - otherwise text wraps and creates
          // a taller measurement than we would want
          style={hasBeenMeasured ? undefined : { minWidth, minHeight, maxWidth, maxHeight }}
          ref={contentRef}
        >
          {children}
        </div>
      </animated.div>
    </DraggableContext.Provider>
  );
};
