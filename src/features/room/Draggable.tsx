import * as React from 'react';
import { animated, SpringValue, useSpring } from '@react-spring/web';
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

const draggableSpringConfig = {
  mass: 1,
  tension: 500,
  friction: 30,
};

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    willChange: 'transform, left, top',
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
        (positions, objectId) => positions[objectId]?.position ?? { x: 0, y: 0 }
      ),
    []
  );
  const position = useSelector((state: RootState) => positionSelector(state, id));

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

  // This spring gradually interpolates the object into its desired position
  // after a change. That change might happen because the user dragged it,
  // or a new position has come in from the server.
  const [{ x, y, grabbing }, set] = useSpring(() => ({
    // initial values
    x: position.x,
    y: position.y,
    grabbing: false,
    config: draggableSpringConfig,
  }));

  // Update the spring when any of the monitored spatial values change
  React.useEffect(() => {
    set({
      x: position.x,
      y: position.y,
    });
  }, [position.x, position.y, set]);

  // binds drag controls to the underlying element
  const bind = useGesture(
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
    <DraggableContext.Provider value={{ dragHandleProps: bind(), isDraggingAnimatedValue: grabbing }}>
      <animated.div
        style={{
          // for now, just compute positions of all Draggables from
          // their center
          left: x,
          top: y,
          transform: `translate(-50%, -50%)`,
          zIndex: zIndex as any,
          cursor: grabbing.to((isGrabbing) => (isGrabbing ? 'grab' : 'inherit')),
        }}
        className={styles.root}
      >
        {children}
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
export function DraggableHandle({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
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
    >
      {children}
    </animated.div>
  );
}
