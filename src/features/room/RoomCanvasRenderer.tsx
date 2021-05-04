import * as React from 'react';
import { Vector2 } from '../../types/spatials';
import { animated, useSpring, to } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { makeStyles, Theme } from '@material-ui/core';
import { useKeyboardControls } from '../roomControls/viewport/useKeyboardControls';
import useMergedRefs from '@react-hook/merged-ref';
import { FileDropLayer } from './files/FileDropLayer';
import { useRoomStore } from '../../roomState/useRoomStore';
import { MediaReadinessContext } from '../../components/MediaReadinessProvider/MediaReadinessProvider';
import { useTrackCursor } from './useTrackCursor';
import { EventEmitter } from 'events';
import { useLocalStorage } from '../../hooks/useLocalStorage/useLocalStorage';
import { useViewport } from '../../providers/viewport/useViewport';
import { ViewportEventOrigin } from '../../providers/viewport/Viewport';
import { mandarin as theme } from '../../theme/theme';
import { SPRINGS } from '../../constants/springs';

/**
 * These event handlers correspond to the easing functions
 * used to animate the view. Events fire on the start and
 * end point of each kind of animation, as well as start
 * and end for users dragging objects within the canvas.
 */
export interface RoomCanvasEventHandlers {
  zoomStart: () => void;
  zoomEnd: () => void;
  dragStart: () => void;
  dragEnd: () => void;
  panStart: () => void;
  panEnd: () => void;
}
export declare interface RoomCanvasEvents {
  on<U extends keyof RoomCanvasEventHandlers>(event: U, listener: RoomCanvasEventHandlers[U]): this;
  off<U extends keyof RoomCanvasEventHandlers>(event: U, listener: RoomCanvasEventHandlers[U]): this;
  emit<U extends keyof RoomCanvasEventHandlers>(event: U, ...args: Parameters<RoomCanvasEventHandlers[U]>): boolean;
}
/**
 * RoomCanvasEvents is a typed EventEmitter which provides a way for components further down
 * in the tree to react to changes in the viewport. Right now we just support an event
 * fired when a zoom has completed.
 */
export class RoomCanvasEvents extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100000);
  }
}

export const RoomCanvasRendererContext = React.createContext<null | {
  onObjectDragStart: () => void;
  onObjectDragEnd: () => void;
  width: number;
  height: number;
  events: RoomCanvasEvents;
}>(null);

export function useRoomCanvas() {
  const context = React.useContext(RoomCanvasRendererContext);
  if (!context) {
    throw new Error('You must call useRoomCanvs inside a RoomCanvasRenderer');
  }
  return context;
}

export interface IRoomCanvasRendererProps {
  children: React.ReactNode;
}

const PINCH_GESTURE_DAMPING = 500;
const WHEEL_GESTURE_DAMPING = 400;
const VIEWPORT_ORIGIN_SPRINGS = {
  control: SPRINGS.QUICK,
  animation: SPRINGS.RELAXED,
  // not actually used, for direct we do immediate:true to disable
  // easing
  direct: SPRINGS.RESPONSIVE,
};

const DESKTOP_INITIAL_ZOOM = 1.25;
const MOBILE_INITIAL_ZOOM = 1;
const isMobile = typeof window !== 'undefined' && window.matchMedia(theme.breakpoints.down('sm'));
const INITIAL_ZOOM = isMobile ? MOBILE_INITIAL_ZOOM : DESKTOP_INITIAL_ZOOM;

const DEBUG_RENDER_CENTER_RETICLE = localStorage.getItem('DEBUG') === 'true';

const useStyles = makeStyles<Theme, IRoomCanvasRendererProps>((theme) => ({
  fileDropLayer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  viewport: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'move',
    position: 'relative',
    touchAction: 'none',
    contain: 'strict',
    '&:focus': {
      outline: 'none',
    },
  },
  canvas: {
    position: 'absolute',
    transformOrigin: 'center center',
    borderRadius: theme.shape.borderRadius,
    backgroundRepeat: 'repeat',
    backgroundSize: '2400px 2400px',
  },
}));

export const RoomCanvasRenderer: React.FC<IRoomCanvasRendererProps> = (props) => {
  const styles = useStyles(props);

  const { children, ...rest } = props;

  const [events] = React.useState(() => new RoomCanvasEvents());

  const [savedZoom, setSavedZoom] = useLocalStorage('with_savedZoom', INITIAL_ZOOM);

  const bounds = useRoomStore((room) => ({ width: room.state.width, height: room.state.height }));
  const backgroundUrl = useRoomStore((room) => room.state.wallpaperUrl);

  const viewportElementRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const viewport = useViewport();

  // keep track of viewport element size as provided by Viewport class
  const [viewportSize, setViewportSize] = React.useState(viewport.size);
  React.useEffect(() => {
    viewport.on('sizeChanged', setViewportSize);
    return () => void viewport.off('sizeChanged', setViewportSize);
  }, [viewport]);
  const halfCanvasWidth = bounds.width / 2;
  const halfCanvasHeight = bounds.height / 2;

  // initializes canvas size
  React.useLayoutEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    canvasEl.style.width = `${bounds.width}px`;
    canvasEl.style.height = `${bounds.height}px`;
    canvasEl.style.backgroundImage = `url(${backgroundUrl})`;
  }, [canvasRef, bounds, backgroundUrl]);

  // the main spring which controls the Canvas transformation.
  // X/Y position is in World Space - i.e. the coordinate space
  // is not affected by the zoom
  const [{ centerX, centerY }, panSpring] = useSpring(() => ({
    centerX: 0,
    centerY: 0,
    isPanning: false,
    config: SPRINGS.RELAXED,
  }));
  const [{ zoom }, zoomSpring] = useSpring(() => ({
    zoom: viewport.zoom,
    isZooming: false,
    config: SPRINGS.RELAXED,
  }));

  React.useEffect(() => {
    async function handleCenterChanged(center: Readonly<Vector2>, origin: ViewportEventOrigin) {
      events.emit('panStart');
      await panSpring.start({
        centerX: center.x,
        centerY: center.y,
        isPanning: true,
        immediate: origin === 'direct',
        config: VIEWPORT_ORIGIN_SPRINGS[origin],
      })[0];
      await panSpring.start({ isPanning: false })[0];
      events.emit('panEnd');
    }
    async function handleZoomChanged(zoomValue: number, origin: ViewportEventOrigin) {
      events.emit('zoomStart');
      setSavedZoom(zoomValue);
      await zoomSpring.start({
        zoom: zoomValue,
        isZooming: true,
        immediate: origin === 'direct',
        config: VIEWPORT_ORIGIN_SPRINGS[origin],
      })[0];
      await zoomSpring.start({ isZooming: false })[0];
      events.emit('zoomEnd');
    }
    viewport.on('centerChanged', handleCenterChanged);
    viewport.on('zoomChanged', handleZoomChanged);
    return () => {
      viewport.off('centerChanged', handleCenterChanged);
      viewport.off('zoomChanged', handleZoomChanged);
    };
  }, [viewport, panSpring, zoomSpring, events, setSavedZoom]);

  const userId = useRoomStore((room) => (room.sessionId && room.sessionLookup[room.sessionId]) ?? null);
  const { isReady } = React.useContext(MediaReadinessContext);

  // these need to be cached in refs so they don't invalidate the effect
  // below when the window size changes.
  const savedZoomRef = React.useRef(savedZoom);
  // on first mount, the view is zoomed out at the center of the room
  // wait a moment, then zoom in to the user's avatar
  React.useEffect(() => {
    if (!isReady) return;

    const timeout = setTimeout(async () => {
      if (!userId) return;

      // find user's position
      const room = useRoomStore.getState();
      const userPosition = room.userPositions[userId];
      const point = userPosition.position;

      viewport.doMove(point, savedZoomRef.current, { origin: 'animation' });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [userId, isReady, viewport]);

  // active is required to prevent default behavior, which
  // we want to do for zoom.
  useGesture(
    {
      onPinch: ({ delta: [_, d], offset: [dist], origin, event }) => {
        event?.preventDefault();
        viewport.doZoom(INITIAL_ZOOM + dist / PINCH_GESTURE_DAMPING, {
          origin: 'direct',
          centroid: { x: origin[0], y: origin[1] },
        });
      },
      onWheel: ({ delta: [x, y], event }) => {
        event?.preventDefault();
        if (event?.ctrlKey || event?.metaKey) {
          viewport.doRelativeZoom(-y / WHEEL_GESTURE_DAMPING, {
            origin: 'direct',
            centroid: { x: event.clientX, y: event.clientY },
          });
        } else {
          viewport.doRelativePan(
            viewport.viewportDeltaToWorld({
              x,
              y,
            }),
            {
              origin: 'direct',
            }
          );
        }
      },
      onPinchStart: ({ event }) => {
        event?.preventDefault();
      },
      onPinchEnd: ({ event }) => {
        event?.preventDefault();
      },
    },
    {
      domTarget: viewportElementRef,
      // keeps the pinch gesture within our min/max zoom bounds,
      // without this you can pinch 'more' than the zoom allows,
      // creating weird deadzones at min and max values where
      // you have to keep pinching to get 'back' into the allowed range
      pinch: {
        distanceBounds: {
          min: (viewport.config.zoomLimits.min - INITIAL_ZOOM) * PINCH_GESTURE_DAMPING,
          max: (viewport.config.zoomLimits.max - INITIAL_ZOOM) * PINCH_GESTURE_DAMPING,
        },
      },
      eventOptions: {
        passive: false,
      },
    }
  );

  const onCursorMove = useTrackCursor();

  const bindPassiveGestures = useGesture({
    onDrag: ({ delta: [x, y] }) => {
      viewport.doRelativePan(viewport.viewportDeltaToWorld({ x: -x, y: -y }), {
        origin: 'direct',
      });
    },
    onMove: ({ xy }) => {
      onCursorMove(viewport.viewportToWorld({ x: xy[0], y: xy[1] }));
    },
  });

  const onObjectDragStart = React.useCallback(() => {
    if (!viewportElementRef.current) return;
    viewportElementRef.current.style.cursor = 'grabbing';
    events.emit('dragStart');
  }, [events]);

  const onObjectDragEnd = React.useCallback(() => {
    if (!viewportElementRef.current) return;
    viewportElementRef.current.style.cursor = 'move';
    events.emit('dragEnd');
  }, [events]);

  // WARNING: it is vital that this be memoized so that performance doesn't
  // decrease as much as we add more widgets. The reason is that a change in
  // this context value will cause all RoomObjects to re-render. RoomObjects
  // should try to re-render infrequently, as they only control the positioning
  // of the room items, but each one re-rendering will also trigger a re-render
  // of its drag handle, and in some cases (like people) the drag handle is
  // the entire item, so the whole item gets re-rendered. It's a tricky cascade,
  // but keeping that rendering to a minimum really makes a difference for performance.
  // To that end - avoid at all possible making this value change. Right now it
  // only depends on stable references. Some of the referenced functions, like
  // doPan and doZoom, may seem volatile - but they are all just memoized
  // on stable references to spring values and other things which are not
  // going to change often, like the size of the room.
  const infoContextValue = React.useMemo(
    () => ({
      viewport,
      onObjectDragStart,
      onObjectDragEnd,
      width: bounds.width,
      height: bounds.height,
      events,
    }),
    [bounds.height, bounds.width, events, onObjectDragEnd, onObjectDragStart, viewport]
  );

  const { props: keyControlProps } = useKeyboardControls(viewport);

  const viewportRef = useMergedRefs(keyControlProps.ref, viewportElementRef, viewport.bindElement);

  return (
    <RoomCanvasRendererContext.Provider value={infoContextValue}>
      <animated.div
        className={styles.viewport}
        {...keyControlProps}
        ref={viewportRef}
        aria-labelledby="keyboard-explainer"
        {...bindPassiveGestures()}
        {...rest}
      >
        <FileDropLayer className={styles.fileDropLayer}>
          <animated.div
            className={styles.canvas}
            ref={canvasRef}
            style={{
              transform: to([centerX, centerY, zoom], (cx, cy, zoomv) => {
                // 1. Translate the center of the canvas to 0,0 (-halfCanvasWidth, -halfCanvasHeight)
                // 2. Translate that center point back to the center of the screen (+viewport.size.width / 2, +viewport.size.height / 2)
                // 3. Scale up (or down) to the specified zoom value
                // 4. Translate the center according to the pan position
                return `translate(${-halfCanvasWidth}px, ${-halfCanvasHeight}px) translate(${
                  viewportSize.width / 2
                }px, ${viewportSize.height / 2}px) scale(${zoomv}, ${zoomv}) translate(${-cx}px, ${-cy}px)`;
              }),
            }}
          >
            {children}
          </animated.div>
        </FileDropLayer>
        {DEBUG_RENDER_CENTER_RETICLE && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1,
              height: 1,
              backgroundColor: 'red',
              zIndex: 10000,
            }}
          />
        )}
      </animated.div>
    </RoomCanvasRendererContext.Provider>
  );
};
