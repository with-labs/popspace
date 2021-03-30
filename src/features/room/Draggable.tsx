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
import clsx from 'clsx';

// the time slicing for throttling movement events being sent over the
// network. Setting this too high will make movement look laggy for peers,
// but doesn't affect the local experience.
const MOVE_THROTTLE_PERIOD = 50;
const TOP_LEFT_ORIGIN = {
  vertical: 0,
  horizontal: 0,
};

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
  /**
   * Applies a CSS class name to the drag container
   */
  className?: string;
  /**
   * Optionally, you can customize how the draggable positions itself
   * relative to its position coordinate value. Values are 0-1.0,
   * representing percentages.
   */
  origin?: {
    vertical: number;
    horizontal: number;
  };
}

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    touchAction: 'none',
    willChange: 'transform',
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
export const Draggable: React.FC<IDraggableProps> = ({
  id,
  children,
  zIndex = 0,
  onDragEnd,
  onDragStart,
  kind,
  className,
  origin = TOP_LEFT_ORIGIN,
}) => {
  const styles = useStyles();

  const ref = React.useRef<HTMLDivElement>(null);

  // dispatcher for movement changes
  const api = useRoomStore((store) => store.api);
  const onMove = React.useMemo(
    () =>
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

  React.useEffect(() => {
    /**
     * Dirty trick ahead - literally!
     * This function forces an invalidation of the rasterized layer for
     * this draggable (hence the 'dirty' joke, get it?). It does that by toggling
     * off will-change: transform for one frame, then toggling it back on again. This
     * effectively 'flattens' the layer which is created for this specific item back into
     * the canvas (will-change: initial), then recreates the layer again (will-change: transform).
     * Doing so re-rasterizes the layer at the current scale level, so that even 2x images and text
     * are re-sharpened.
     *
     * We need this trick because just applying `will-change: transform` all the time doesn't seem
     * to properly re-rasterize when the scale changes, leading to blurriness. By manually invalidating
     * the layer (read: not just invalidating but trashing and re-creating - this could be less than
     * desirable) we can choose to re-sharpen the contents after the user has changed the zoom of the
     * viewport, which is the most logical and only necessary time to do it.
     *
     * TODO: if we need to optimize this even further, we could avoid re-rasterizing widgets which are
     * currently offscreen!
     */
    const rerasterize = () => {
      requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.willChange = 'initial';
        requestAnimationFrame(() => {
          if (!ref.current) return;
          ref.current.style.willChange = 'transform';
        });
      });
    };
    viewport.events.on('zoomEnd', rerasterize);
    return () => {
      viewport.events.off('zoomEnd', rerasterize);
    };
  }, [viewport.events]);

  const selectPosition = React.useCallback(
    (room: RoomStateShape) =>
      kind === 'widget' ? room.widgetPositions[id]?.position : room.userPositions[id]?.position ?? { x: 0, y: 0 },
    [kind, id]
  );

  // This spring gradually interpolates the object into its desired position
  // after a change. That change might happen because the user dragged it,
  // or a new position has come in from the server.
  const { current: initialPosition } = React.useRef(selectPosition(useRoomStore.getState()));
  const [{ x, y, grabbing }, spring] = useSpring(() => ({
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
          spring.start({
            x: pos.x,
            y: pos.y,
          });
        }
      }, selectPosition),
    [spring, grabbing, selectPosition]
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
      spring.start(finalPosition);
    };
    autoPan.on('pan', handleAutoPan);
    return () => {
      autoPan.off('pan', handleAutoPan);
    };
  }, [autoPan, toWorldCoordinate, onMove, spring]);

  // binds drag controls to the underlying element
  const bindDragHandle = useGesture(
    {
      onDrag: (state) => {
        if (state.distance > 10) {
          spring.set({ grabbing: true });
        }

        if (state.event?.target) {
          // BUGFIX: a patch which is intended to prevent a bug where opening a menu
          // or other popover from within a draggable allows dragging by clicking anywhere
          // on the screen, since the whole screen is covered by a click-blocker element
          // ignore drag events which target an aria-hidden element
          if ((state.event.target as HTMLElement).getAttribute('aria-hidden')) {
            return;
          }
        }

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
        spring.set({
          x: finalPosition.x,
          y: finalPosition.y,
        });

        autoPan.update({ x: state.xy[0], y: state.xy[1] });
      },
      onDragStart: (state) => {
        viewport.onObjectDragStart();
        autoPan.start({ x: state.xy[0], y: state.xy[1] });
        onDragStart?.();
      },
      onDragEnd: (state) => {
        state.event?.stopPropagation();
        viewport.onObjectDragEnd();
        spring.set({ grabbing: false });
        autoPan.stop();
        onDragEnd?.();
      },
    },
    {
      eventOptions: {
        capture: false,
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
        ref={ref}
        style={{
          transform: to(
            [x, y],
            (xv, yv) =>
              `translate(${Math.round(xv + viewport.width / 2)}px, ${Math.round(
                yv + viewport.height / 2
              )}px) translate(${-origin.horizontal * 100}%, ${-origin.vertical * 100}%)`
          ),
          zIndex: zIndex as any,
          cursor: grabbing.to((isGrabbing) => (isGrabbing ? 'grab' : 'inherit')),
        }}
        className={clsx(styles.root, className)}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
        id={`${kind}-${id}`}
        {...bindRoot()}
      >
        {children}
      </animated.div>
    </DraggableContext.Provider>
  );
};
