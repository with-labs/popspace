import * as React from 'react';
import { animated, SpringValue, useSpring, to } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';
import { makeStyles } from '@material-ui/core';
import { useRoomViewport } from './RoomViewport';
import { useSelector } from 'react-redux';
import { actions } from './roomSlice';
import { useCoordinatedDispatch } from './CoordinatedDispatchProvider';
import { Vector2 } from '../../types/spatials';
import { addVectors, roundVector, subtractVectors } from '../../utils/math';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../state/store';
import clsx from 'clsx';

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

const DraggableContext = React.createContext<{
  dragHandleProps: ReactEventHandlers;
  isDraggingAnimatedValue: SpringValue<boolean>;
}>({
  dragHandleProps: {},
  isDraggingAnimatedValue: null as any,
});

/**
 * A Draggable is a generic container for any element within a Room which
 * can be moved or resized. Wrap any other component in Draggable to make
 * it interactive. Pass `children` as a function which receives a bind()
 * function you should call, then pass the result directly to the draggable
 * portion of your widget.
 */
export const Draggable: React.FC<IDraggableProps> = ({ id, children, zIndex = 0 }) => {
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

  const viewport = useRoomViewport();

  const contentRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      // on the first mount, we measure the size of the content and
      // set that as the initial size in state.
      if (el) {
        const width = el.clientWidth;
        const height = el.clientHeight;
        coordinatedDispatch(
          actions.resizeObject({
            id,
            size: { width, height },
          })
        );
      }
    },
    [coordinatedDispatch, id]
  );

  // This spring gradually interpolates the object into its desired position
  // after a change. That change might happen because the user dragged it,
  // or a new position has come in from the server.
  const [{ x, y, width, height, grabbing }, set] = useSpring(() => ({
    // initial values
    x: position.x,
    y: position.y,
    width: measuredWidth,
    height: measuredHeight,
    grabbing: false,
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
        viewport.onObjectDragStart();
        set({ grabbing: true });
      },
      onDragEnd: (state) => {
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

  return (
    <DraggableContext.Provider value={{ dragHandleProps: bindDragHandle(), isDraggingAnimatedValue: grabbing }}>
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
        <div className={clsx(hasBeenMeasured ? styles.contentSizer : styles.unmeasuredContentSizer)} ref={contentRef}>
          {children}
        </div>
      </animated.div>
    </DraggableContext.Provider>
  );
};

export function useRoomObjectDragHandle() {
  const { dragHandleProps } = React.useContext(DraggableContext);

  const bind = React.useMemo(
    () => ({
      ...dragHandleProps,
      onPointerEnter: (ev: React.PointerEvent<HTMLElement>) => {
        ev.currentTarget.style.cursor = 'grab';
      },
      onPointerLeave: (ev: React.PointerEvent<HTMLElement>) => {
        ev.currentTarget.style.cursor = 'initial';
      },
      onMouseEnter: (ev: React.MouseEvent<HTMLElement>) => {
        ev.currentTarget.style.cursor = 'grab';
      },
      onMouseLeave: (ev: React.MouseEvent<HTMLElement>) => {
        ev.currentTarget.style.cursor = 'initial';
      },
    }),
    [dragHandleProps]
  );

  return bind;
}

/**
 * This component is *required* for use inside a Draggable. It should wrap the portion of the draggable
 * item which the user can actually click on to drag around. If the whole item is interactive, just
 * wrap it all in DraggableHandle.
 */
export function DraggableHandle({
  children,
  className,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { dragHandleProps, isDraggingAnimatedValue } = React.useContext(DraggableContext);

  if (!dragHandleProps || !isDraggingAnimatedValue) {
    // using this component outside of context - this could sometimes be valid, maybe?
    // just ignore all the drag handle stuff and return the content
    return children;
  }

  return (
    <animated.div
      {...(disabled ? {} : dragHandleProps)}
      style={{ cursor: isDraggingAnimatedValue.to((v) => (disabled ? 'inherit' : v ? 'grabbing' : 'grab')) }}
      className={className}
    >
      {children}
    </animated.div>
  );
}
