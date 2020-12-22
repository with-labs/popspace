import * as React from 'react';
import { Bounds, Vector2 } from '../../types/spatials';
import { clamp, clampVector } from '../../utils/math';
import useWindowSize from '../../hooks/useWindowSize/useWindowSize';
import { animated, useSpring, to } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { makeStyles, Theme } from '@material-ui/core';
import { useKeyboardControls } from '../roomControls/viewport/useKeyboardControls';
import useMergedRefs from '@react-hook/merged-ref';
import { FileDropLayer } from './files/FileDropLayer';
import { mandarin as theme } from '../../theme/theme';

export const RoomViewportContext = React.createContext<null | {
  toWorldCoordinate: (screenCoordinate: Vector2, clampToBounds?: boolean) => Vector2;
  getZoom: () => number;
  onObjectDragStart: () => void;
  onObjectDragEnd: () => void;
  pan: (delta: Vector2) => void;
  zoom: (delta: number) => void;
  width: number;
  height: number;
}>(null);

export function useRoomViewport() {
  const context = React.useContext(RoomViewportContext);
  if (!context) {
    throw new Error('You must call useRoomViewport inside a RoomViewport');
  }
  return context;
}

export interface IRoomViewportProps {
  children: React.ReactNode;
  /** The total canvas size */
  bounds: Bounds;
  /** The background image for the canvas */
  backgroundUrl: string;
  /** Configure the minimum zoom ratio - smaller means the room gets smaller */
  minZoom?: number;
  /** Configure the maximum zoom ratio - larger means the room gets larger */
  maxZoom?: number;
  /**
   * Pass content to this prop to render it within the viewport context,
   * but independent of the canvas transformation (i.e. floating UI content
   * that needs to be within the viewport context for certain information)
   */
  uiControls: React.ReactNode;
}

const DESKTOP_INITIAL_ZOOM = 1;
const MOBILE_INITIAL_ZOOM = 0.75;
const isMobile = typeof window !== 'undefined' && window.matchMedia(theme.breakpoints.down('sm'));
const INITIAL_ZOOM = isMobile ? MOBILE_INITIAL_ZOOM : DESKTOP_INITIAL_ZOOM;
const PINCH_GESTURE_DAMPING = 200;
const WHEEL_GESTURE_DAMPING = 400;
// how much "empty space" the user can see at the edge of the world,
// in viewport pixels. Needs to be large enough that the dock and
// any other UI doesn't overlap items on the edges at all times, so
// the user can at least pan to a position where they can reach the
// item.
const PAN_BUFFER = 100;
const VIEWPORT_PAN_SPRING = {
  tension: 500,
  friction: 20,
  mass: 0.1,
};
const VIEWPORT_ZOOM_SPRING = {
  tension: 700,
  friction: 40,
  mass: 0.1,
};

const useStyles = makeStyles<Theme, IRoomViewportProps>({
  viewport: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'move',
    position: 'relative',
    touchAction: 'none',
  },
  canvas: {
    position: 'absolute',
    transformOrigin: 'center center',
    borderRadius: 10,
  },
  centeredSpaceTransformer: ({ bounds }) => ({
    overflow: 'visible',
    transform: `translate(${bounds.width / 2}px, ${bounds.height / 2}px)`,
  }),
});

export const RoomViewport: React.FC<IRoomViewportProps> = (props) => {
  const styles = useStyles(props);

  const { children, bounds, minZoom = 1 / 4, maxZoom = 2, backgroundUrl, uiControls, ...rest } = props;

  const domTarget = React.useRef<HTMLDivElement>(null);

  // some basic necessary variables
  const [windowWidth, windowHeight] = useWindowSize();
  const halfWindowWidth = windowWidth / 2;
  const halfWindowHeight = windowHeight / 2;
  const halfCanvasWidth = bounds.width / 2;
  const halfCanvasHeight = bounds.height / 2;

  // the main spring which controls the Canvas transformation.
  // X/Y position is in World Space - i.e. the coordinate space
  // is not affected by the zoom
  const [{ centerX, centerY }, setPanSpring] = useSpring(() => ({
    centerX: 0,
    centerY: 0,
    isPanning: false,
    config: VIEWPORT_PAN_SPRING,
  }));
  const [{ zoom, isZooming }, setZoomSpring] = useSpring(() => ({
    zoom: INITIAL_ZOOM,
    isZooming: false,
    config: VIEWPORT_ZOOM_SPRING,
  }));

  const toWorldCoordinate = React.useCallback(
    (screenPoint: Vector2, clampToBounds: boolean = false) => {
      const scale = 1 / zoom.goal;
      const currentCenterX = centerX.goal;
      const currentCenterY = centerY.goal;

      // This was a bit trial-and-error, but:
      // 1. subtract half of the window size
      //      Imagine the viewport was centered at 0,0 in world space (the center of the window
      //      is exactly at the center of the room). if the user
      //      moved an object toward the upper left corner of their screen,
      //      that would logically be in negative world coordinate space -
      //      however, screen coordinates are only positive from the top left corner.
      //      this is basically the part that converts from a top-left to a center-based
      //      positioning system.
      // 2. scale based on zoom
      //      scaling for zoom is necessary - imagine if you are at 0.5x zoom and you move
      //      the object 10 pixels to the left - you are actually moving 20 pixels of world
      //      space because the world is half-size.
      // 3. subtract the pan of the canvas
      //      subtracting the pan value accommodates for the fact that pan moves the world
      //      independently of the visible screen space, so we need to add that offset in.
      //      this is done OUTSIDE of the zoom scaling because the pan coordinate is already
      //      in world space and doesn't need to be adjusted for zoom.
      const transformedPoint = {
        x: (screenPoint.x - halfWindowWidth) * scale - currentCenterX,
        y: (screenPoint.y - halfWindowHeight) * scale - currentCenterY,
      };

      // restrict the point to the room bounds, if desired
      if (clampToBounds) {
        return clampVector(
          transformedPoint,
          {
            x: -halfCanvasWidth,
            y: -halfCanvasHeight,
          },
          {
            x: halfCanvasWidth,
            y: halfCanvasHeight,
          }
        );
      }

      return transformedPoint;
    },
    [zoom.goal, centerX.goal, centerY.goal, halfWindowWidth, halfWindowHeight, halfCanvasWidth, halfCanvasHeight]
  );

  const clampPanPosition = React.useCallback(
    (panPosition: Vector2) => {
      const scale = zoom.goal;

      const worldScreenWidth = windowWidth / scale;
      const worldScreenHeight = windowHeight / scale;

      const panBufferWorldSize = PAN_BUFFER / scale;

      const minX = Math.min(0, -halfCanvasWidth + worldScreenWidth / 2) - panBufferWorldSize;
      const maxX = Math.max(0, halfCanvasWidth - worldScreenWidth / 2) + panBufferWorldSize;
      const minY = Math.min(0, -halfCanvasHeight + worldScreenHeight / 2) - panBufferWorldSize;
      const maxY = Math.max(0, halfCanvasHeight - worldScreenHeight / 2) + panBufferWorldSize;

      return {
        x: clamp(panPosition.x, minX, maxX),
        y: clamp(panPosition.y, minY, maxY),
      };
    },
    [halfCanvasHeight, halfCanvasWidth, zoom, windowWidth, windowHeight]
  );

  const doAbsoluteZoom = React.useCallback(
    (val: number) => {
      const clamped = clamp(val, minZoom, maxZoom);

      // also update pan position as the user zooms, since
      // the allowed boundary changes slightly as the zoom changes
      const clampedPan = clampPanPosition({
        x: centerX.goal,
        y: centerY.goal,
      });

      setZoomSpring({
        zoom: clamped,
      });
      setPanSpring({
        centerX: clampedPan.x,
        centerY: clampedPan.y,
      });
    },
    [centerX, centerY, clampPanPosition, maxZoom, minZoom, setZoomSpring, setPanSpring]
  );

  const doZoom = React.useCallback(
    (delta: number) => {
      const currentZoom = zoom.goal;
      const added = currentZoom + delta;
      doAbsoluteZoom(added);
    },
    [doAbsoluteZoom, zoom]
  );

  const doPan = React.useCallback(
    (delta: Vector2) => {
      // when the user drags, we constrain the distance they can
      // move the canvas to keep it on screen
      // TODO: figure out how to do this with gesture constraints
      // instead of hard-constraining the value (advantage: we can
      // have some elasticity to the boundary collision)
      const clamped = clampPanPosition({
        x: centerX.goal - delta.x / zoom.goal,
        y: centerY.goal - delta.y / zoom.goal,
      });

      setPanSpring({
        centerX: clamped.x,
        centerY: clamped.y,
      });
    },
    [centerX, centerY, clampPanPosition, setPanSpring, zoom]
  );

  // active is required to prevent default behavior, which
  // we want to do for zoom.
  useGesture(
    {
      onPinch: ({ delta: [_, d], offset: [dist], event }) => {
        event?.preventDefault();
        doAbsoluteZoom(INITIAL_ZOOM + dist / PINCH_GESTURE_DAMPING);
      },
      onWheel: ({ delta: [x, y], event }) => {
        event?.preventDefault();
        if (event?.ctrlKey || event?.metaKey) {
          doZoom(-y / WHEEL_GESTURE_DAMPING);
        } else {
          doPan({
            x,
            y,
          });
        }
      },
      onPinchStart: ({ event }) => {
        event?.preventDefault();
        setZoomSpring({ isZooming: true });
      },
      onPinchEnd: ({ event }) => {
        event?.preventDefault();
        setZoomSpring({ isZooming: false });
      },
    },
    {
      domTarget,
      // keeps the pinch gesture within our min/max zoom bounds,
      // without this you can pinch 'more' than the zoom allows,
      // creating weird deadzones at min and max values where
      // you have to keep pinching to get 'back' into the allowed range
      pinch: {
        distanceBounds: {
          min: (minZoom - INITIAL_ZOOM) * PINCH_GESTURE_DAMPING,
          max: (maxZoom - INITIAL_ZOOM) * PINCH_GESTURE_DAMPING,
        },
      },
      eventOptions: {
        passive: false,
      },
    }
  );

  const bindPassiveGestures = useGesture({
    onDrag: ({ delta: [x, y] }) => {
      doPan({ x: -x, y: -y });
    },
    onDragStart: () => {
      setPanSpring({ isPanning: true });
    },
    onDragEnd: () => {
      setPanSpring({ isPanning: false });
    },
    onWheelStart: ({ event }) => {
      if (event?.ctrlKey) {
        setZoomSpring({ isZooming: true });
      } else {
        setPanSpring({ isPanning: true });
      }
    },
    onWheelEnd: () => {
      if (isZooming.goal) {
        setZoomSpring({ isZooming: false });
      } else {
        setPanSpring({ isPanning: false });
      }
    },
  });

  const onObjectDragStart = React.useCallback(() => {
    if (!domTarget.current) return;
    domTarget.current.style.cursor = 'grabbing';
  }, []);

  const onObjectDragEnd = React.useCallback(() => {
    if (!domTarget.current) return;
    domTarget.current.style.cursor = 'move';
  }, []);

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
      toWorldCoordinate,
      getZoom: zoom.get,
      onObjectDragStart,
      onObjectDragEnd,
      pan: doPan,
      zoom: doZoom,
      width: bounds.width,
      height: bounds.height,
    }),
    [toWorldCoordinate, zoom, onObjectDragStart, onObjectDragEnd, doPan, doZoom, bounds.width, bounds.height]
  );

  const { props: keyControlProps } = useKeyboardControls({
    pan: doPan,
    zoom: doZoom,
  });

  const viewportRef = useMergedRefs(keyControlProps.ref, domTarget);

  return (
    <RoomViewportContext.Provider value={infoContextValue}>
      <animated.div
        className={styles.viewport}
        {...keyControlProps}
        ref={viewportRef}
        aria-labelledby="keyboard-explainer"
        {...bindPassiveGestures()}
        {...rest}
      >
        <FileDropLayer>
          <animated.div
            className={styles.canvas}
            style={{
              transform: to([centerX, centerY, zoom], (cx, cy, zoomv) => {
                const x = cx * zoomv - halfCanvasWidth + halfWindowWidth;
                const y = cy * zoomv - halfCanvasHeight + halfWindowHeight;

                return `translate(${x}px, ${y}px) scale(${zoomv}, ${zoomv})`;
              }),
              width: bounds.width,
              height: bounds.height,
              backgroundImage: `url(${backgroundUrl})` as any,
              backgroundSize: 'cover',
            }}
          >
            {/* 
              Converts from top-left coords to center-based coords -
              widgets in the room use center-based coords but their DOM
              placement still needs to be adjusted because the DOM lays out
              from top-left. This CSS class just translates the entire
              container element to the center and allows elements with negative
              positions to still be visible with overflow: visible.
              */}
            <div className={styles.centeredSpaceTransformer}>{children}</div>
          </animated.div>
        </FileDropLayer>
      </animated.div>
      {uiControls}
    </RoomViewportContext.Provider>
  );
};
