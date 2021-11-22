import { RefObject } from 'react';
import { useGesture } from 'react-use-gesture';
import { useTrackCursor } from '@features/room/useTrackCursor';
import { Viewport } from './Viewport';
import { useViewportGestureState } from './useViewportGestureState';

const PINCH_GESTURE_DAMPING = 500;
const WHEEL_GESTURE_DAMPING = 400;

export interface ViewportGestureConfig {
  initialZoom: number;
}

export function useViewportGestureControls(
  viewport: Viewport,
  ref: RefObject<HTMLElement>,
  { initialZoom }: ViewportGestureConfig
) {
  const { onGestureStart, onGestureEnd } = useViewportGestureState((s) => s.api);

  // active is required to prevent default behavior, which
  // we want to do for zoom.
  useGesture(
    {
      onPinch: ({ delta: [_, d], offset: [dist], origin, event }) => {
        event?.preventDefault();
        viewport.doZoom(initialZoom + dist / PINCH_GESTURE_DAMPING, {
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
        onGestureStart();
      },
      onPinchEnd: ({ event }) => {
        event?.preventDefault();
        onGestureEnd();
      },
      onWheelStart: ({ event }) => {
        event?.preventDefault();
        onGestureStart();
      },
      onWheelEnd: ({ event }) => {
        event?.preventDefault();
        onGestureEnd();
      },
    },
    {
      domTarget: ref,
      // keeps the pinch gesture within our min/max zoom bounds,
      // without this you can pinch 'more' than the zoom allows,
      // creating weird deadzones at min and max values where
      // you have to keep pinching to get 'back' into the allowed range
      pinch: {
        distanceBounds: {
          min: (viewport.config.zoomLimits.min - initialZoom) * PINCH_GESTURE_DAMPING,
          max: (viewport.config.zoomLimits.max - initialZoom) * PINCH_GESTURE_DAMPING,
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
    onDragStart: onGestureStart,
    onDragEnd: onGestureEnd,
  });

  return bindPassiveGestures();
}
