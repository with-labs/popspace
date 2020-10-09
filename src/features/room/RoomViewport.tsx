import * as React from 'react';
import { Bounds, Vector2 } from '../../types/spatials';
import { clamp } from '../../utils/math';
import useWindowSize from '../../withHooks/useWindowSize/useWindowSize';
import { animated, useSpring, to } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { makeStyles, Theme } from '@material-ui/core';

const RoomViewportContext = React.createContext<{
  toWorldCoordinate: (screenCoordinate: Vector2) => Vector2;
  getZoom: () => number;
  onObjectDragStart: () => void;
  onObjectDragEnd: () => void;
}>({
  toWorldCoordinate: () => ({ x: 0, y: 0 }),
  getZoom: () => 1,
  onObjectDragStart: () => {},
  onObjectDragEnd: () => {},
});

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
  uiContent: React.ReactNode;
}

const PINCH_GESTURE_DAMPING = 4000;
const WHEEL_GESTURE_DAMPING = 4000;
// how much "empty space" the user can see at the edge of the world,
// in viewport pixels
const PAN_BUFFER = 50;

const useStyles = makeStyles<Theme, IRoomViewportProps>({
  viewport: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    userSelect: 'none',
    cursor: 'move',
  },
  canvas: {
    transformOrigin: 'center center',
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  centeredSpaceTransformer: ({ bounds }) => ({
    overflow: 'visible',
    transform: `translate3d(${bounds.width / 2}px, ${bounds.height / 2}px, 0)`,
  }),
});

export const RoomViewport: React.FC<IRoomViewportProps> = (props) => {
  const styles = useStyles(props);
  const { children, bounds, minZoom = 1 / 4, maxZoom = 1, backgroundUrl, uiContent } = props;

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
  const [{ centerX, centerY, zoom }, setCanvasTransform] = useSpring(() => ({
    centerX: 0,
    centerY: 0,
    zoom: 1,
    config: {
      tension: 200,
      friction: 50,
      mass: 1,
    },
  }));

  const toWorldCoordinate = React.useCallback(
    (screenPoint: Vector2) => {
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

      return transformedPoint;
    },
    [zoom, centerX, centerY, halfWindowWidth, halfWindowHeight]
  );

  function clampPanPosition(panPosition: Vector2) {
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
  }

  function doZoom(delta: number) {
    const currentZoom = zoom.goal;
    const added = currentZoom + delta;
    const clamped = clamp(added, minZoom, maxZoom);

    // also update pan position as the user zooms, since
    // the allowed boundary changes slightly as the zoom changes
    const clampedPan = clampPanPosition({
      x: centerX.goal,
      y: centerY.goal,
    });

    setCanvasTransform({
      zoom: clamped,
      centerX: clampedPan.x,
      centerY: clampedPan.y,
    });
  }

  const bind = useGesture(
    {
      onDrag: ({ delta: [x, y] }) => {
        // when the user drags, we constrain the distance they can
        // move the canvas to keep it on screen
        // TODO: figure out how to do this with gesture constraints
        // instead of hard-constraining the value (advantage: we can
        // have some elasticity to the boundary collision)
        const clamped = clampPanPosition({
          x: centerX.goal + x,
          y: centerY.goal + y,
        });

        setCanvasTransform({
          centerX: clamped.x,
          centerY: clamped.y,
        });
      },
      onPinch: ({ offset: [d], event }) => {
        event?.preventDefault();
        doZoom(d / PINCH_GESTURE_DAMPING);
      },
      onWheel: ({ movement: [x, y], event }) => {
        event?.preventDefault();
        doZoom(-y / WHEEL_GESTURE_DAMPING);
      },
    },
    {
      domTarget,
      eventOptions: {
        passive: false,
      },
    }
  );

  // bind our gesture handlers to the global window
  // TODO: this won't be needed in the next major react-spring release
  React.useEffect(() => {
    bind();
  }, [bind]);

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
  // only depends on stable references.
  const contextValue = React.useMemo(
    () => ({
      toWorldCoordinate,
      getZoom: zoom.get,
      onObjectDragStart,
      onObjectDragEnd,
    }),
    [toWorldCoordinate, zoom, onObjectDragStart, onObjectDragEnd]
  );

  return (
    <RoomViewportContext.Provider value={contextValue}>
      <animated.div className={styles.viewport} ref={domTarget}>
        <animated.div
          className={styles.canvas}
          style={{
            transform: to([centerX, centerY, zoom], (cx, cy, zoomv) => {
              const x = cx * zoomv - halfCanvasWidth + halfWindowWidth;
              const y = cy * zoomv - halfCanvasHeight + halfWindowHeight;

              return `translate3d(${x}px, ${y}px, 0) scale(${zoomv}, ${zoomv})`;
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
      </animated.div>
      {uiContent}
    </RoomViewportContext.Provider>
  );
};
