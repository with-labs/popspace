import * as React from 'react';
import { animated, SpringValue, useSpring, to } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';
import { makeStyles } from '@material-ui/core';
import { useRoomViewport } from './RoomViewport';
import { Vector2 } from '../../types/spatials';
import { addVectors, roundVector, subtractVectors } from '../../utils/math';
import { throttle } from 'lodash';
import { AutoPan } from './AutoPan';
import { SPRINGS } from '../../constants/springs';
import { RoomStateShape, useRoomStore } from '../../roomState/useRoomStore';

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
   * Optional callback to listen for drag end events
   */
  onDragEnd?: () => void;
  /**
   * Optional callback to listen for drag start events
   */
  onDragStart?: () => void;
  /**
   * Required so we know which actions to use to report changes
   */
  kind: 'widget' | 'person';
}

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    touchAction: 'none',
  },
});

export const DraggableContext = React.createContext<{
  dragHandleProps: ReactEventHandlers;
  isDraggingAnimatedValue: SpringValue<boolean>;
}>({
  dragHandleProps: {},
  isDraggingAnimatedValue: null as any,
});

const stopPropagation = (ev: React.MouseEvent | React.PointerEvent | React.KeyboardEvent) => {
  ev.stopPropagation();
  ev.nativeEvent.stopImmediatePropagation();
  ev.nativeEvent.stopPropagation();
};

/**
 * A Draggable is a generic container for any element within a Room which
 * can be moved or resized. Wrap any other component in Draggable to make
 * it interactive. Pass `children` as a function which receives a bind()
 * function you should call, then pass the result directly to the draggable
 * portion of your widget.
 */
export const Draggable: React.FC<IDraggableProps> = ({ id, children, zIndex = 0, onDragEnd, onDragStart, kind }) => {
  const styles = useStyles();

  // dispatcher for movement changes
  const api = useRoomStore((store) => store.api);
  const onMove = React.useCallback(
    throttle((newPosition: Vector2) => {
      if (kind === 'widget') {
        api.moveWidget({ widgetId: id, position: newPosition });
      } else {
        api.moveSelf({ position: newPosition });
      }
    }, MOVE_THROTTLE_PERIOD),
    [api, id, kind]
  );

  const viewport = useRoomViewport();

  const selectPosition = React.useCallback(
    (room: RoomStateShape) =>
      kind === 'widget' ? room.widgetPositions[id]?.position : room.userPositions[id]?.position ?? { x: 0, y: 0 },
    [kind, id]
  );

  // This spring gradually interpolates the object into its desired position
  // after a change. That change might happen because the user dragged it,
  // or a new position has come in from the server.
  const { current: initialPosition } = React.useRef(selectPosition(useRoomStore.getState()));
  const [{ x, y, grabbing }, set] = useSpring(() => ({
    // initial values
    x: initialPosition.x,
    y: initialPosition.y,
    grabbing: false,
    config: SPRINGS.RESPONSIVE,
  }));

  // Update the spring when any of the monitored spatial values change,
  // without triggering a React re-render - we subscribe directly to the
  // store in an effect.
  React.useEffect(
    () =>
      useRoomStore.subscribe<Vector2 | null>((pos) => {
        // only update position from Redux if we are not dragging right now
        if (pos && !grabbing.get()) {
          set({
            x: pos.x,
            y: pos.y,
          });
        }
      }, selectPosition),
    [set, grabbing, selectPosition]
  );

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
          const currentPosition = selectPosition(useRoomStore.getState());
          grabDisplacementRef.current = subtractVectors(currentPosition, worldPosition);
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
        onDragStart?.();
      },
      onDragEnd: (state) => {
        state.event?.stopPropagation();
        viewport.onObjectDragEnd();
        set({ grabbing: false });
        autoPan.stop();
        onDragEnd?.();
      },
    },
    {
      eventOptions: {
        capture: true,
      },
    }
  );

  // empty drag hack - if the user initiates a drag gesture
  // within the widget, don't let it bubble up to the viewport
  const bindRoot = useGesture(
    {
      onDragStart: (state) => {
        state.event?.stopPropagation();
        viewport.onObjectDragStart();
      },
      onDragEnd: (state) => {
        state.event?.stopPropagation();
        viewport.onObjectDragEnd();
      },
    },
    {
      eventOptions: {
        // we specifically don't want to capture here - that would
        // possibly override internal gestures within the draggable object.
        // this is just a layer to prevent any unbound gestures which initiate
        // within a draggable object (like whiteboard) from bubbling
        // up to the viewport and being used for pan/zoom
        capture: false,
      },
    }
  );

  return (
    <DraggableContext.Provider
      value={{
        dragHandleProps: bindDragHandle(),
        isDraggingAnimatedValue: grabbing,
      }}
    >
      <animated.div
        style={{
          transform: to([x, y], (xv, yv) => `translate(${Math.round(xv)}px, ${Math.round(yv)}px)`),
          zIndex: zIndex as any,
          cursor: grabbing.to((isGrabbing) => (isGrabbing ? 'grab' : 'inherit')),
        }}
        className={styles.root}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
        {...bindRoot()}
      >
        {children}
      </animated.div>
    </DraggableContext.Provider>
  );
};
