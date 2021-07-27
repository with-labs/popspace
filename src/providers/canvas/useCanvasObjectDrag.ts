import { SPRINGS } from '@constants/springs';
import { useSpring } from '@react-spring/web';
import { addVectors, roundVector, subtractVectors } from '@utils/math';
import { isMiddleClick, isRightClick } from '@utils/mouseButtons';
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGesture } from 'react-use-gesture';

import { Vector2 } from '../../types/spatials';
import { useViewport } from '../viewport/useViewport';
import { AutoPan } from './AutoPan';
import { CanvasObjectKind } from './Canvas';
import { useCanvas } from './CanvasProvider';
import { rerasterizeSignal } from './rerasterizeSignal';

export function useCanvasObjectDrag({
  objectId,
  objectKind,
  ref,
  onDragStart,
  onDragEnd,
}: {
  objectId: string;
  objectKind: CanvasObjectKind;
  ref: RefObject<HTMLDivElement>;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const canvas = useCanvas();
  const viewport = useViewport();

  const [isGrabbing, setIsGrabbing] = useState(false);

  useEffect(() => {
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
    return rerasterizeSignal.subscribe(() => {
      requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.willChange = 'initial';
        requestAnimationFrame(() => {
          if (!ref.current) return;
          ref.current.style.willChange = 'transform';
        });
      });
    });
  }, [ref]);

  // This spring gradually interpolates the object into its desired position
  // after a change. That change might happen because the user dragged it,
  // or a new position has come in from the server.
  const [style, spring] = useSpring(() => {
    const initialPosition = canvas.getPosition(objectId, objectKind);
    return {
      // initial values
      x: initialPosition.x,
      y: initialPosition.y,
      config: SPRINGS.RESPONSIVE,
    };
  });
  const { x, y } = style;

  // a wobbly spring used for the pickup animation effect
  const pickupSpring = useSpring({
    value: isGrabbing ? 1 : 0,
    config: SPRINGS.WOBBLY,
  });

  // Update the spring when any of the monitored spatial values change,
  // without triggering a React re-render - we subscribe directly to the
  // position in an effect and feed values straight to the spring,
  // which will update the element imperatively.
  useEffect(
    () =>
      canvas.observePosition(objectId, objectKind, (pos) => {
        spring.start({
          x: pos.x,
          y: pos.y,
        });
      }),
    [spring, objectId, objectKind, canvas]
  );

  // stores the displacement between the user's grab point and the position
  // of the object, in screen pixels
  const grabDisplacementRef = useRef<Vector2 | null>(null);
  const displace = useCallback((position: Vector2) => {
    return roundVector(addVectors(position, grabDisplacementRef.current ?? { x: 0, y: 0 }));
  }, []);

  // create a private instance of AutoPan to control the automatic panning behavior
  // that occurs as the user drags an item near the edge of the screen.
  const autoPan = useMemo(() => new AutoPan(viewport), [viewport]);
  // we subscribe to auto-pan events so we can update the position
  // of the object as the viewport moves
  useEffect(() => {
    const handleAutoPan = ({ cursorPosition }: { cursorPosition: Vector2 }) => {
      // all we have to do to move the object as the screen auto-pans is re-trigger a
      // move event with the same cursor position - since the view itself has moved 'below' us,
      // the same cursor position produces the new world position.
      const finalPosition = displace(cursorPosition);
      canvas.onObjectDrag(finalPosition, objectId, objectKind);
    };
    autoPan.on('pan', handleAutoPan);
    return () => {
      autoPan.off('pan', handleAutoPan);
    };
  }, [autoPan, viewport, canvas, objectId, objectKind, spring, displace]);

  // binds drag controls to the underlying element
  const bindDragHandle = useGesture({
    onDrag: (state) => {
      if (isRightClick(state.event) || isMiddleClick(state.event)) {
        state.cancel();
        return;
      }

      if (state.event?.target) {
        const element = state.event?.target as HTMLElement;
        // look up the element tree for a hidden or no-drag element to see if dragging is allowed
        // here.
        const dragPrevented =
          element.getAttribute('aria-hidden') === 'true' ||
          element.getAttribute('data-no-drag') === 'true' ||
          !!element.closest('[data-no-drag="true"], [aria-hidden="true"]');
        // BUGFIX: a patch which is intended to prevent a bug where opening a menu
        // or other popover from within a draggable allows dragging by clicking anywhere
        // on the screen, since the whole screen is covered by a click-blocker element
        // ignore drag events which target an aria-hidden element
        if (dragPrevented) {
          state.cancel();
          return;
        }
      }

      if (state.distance > 10) {
        setIsGrabbing(true);
      }

      const positionVector = displace({
        x: state.xy[0],
        y: state.xy[1],
      });

      // send to canvas to be interpreted into movement
      canvas.onObjectDrag(positionVector, objectId, objectKind);

      autoPan.update({ x: state.xy[0], y: state.xy[1] });
    },
    onDragStart: (state) => {
      if (isRightClick(state.event) || isMiddleClick(state.event)) {
        state.cancel();
        return;
      }

      const screenPosition = { x: state.xy[0], y: state.xy[1] };

      // capture the initial displacement between the cursor and the
      // object's center to add to each subsequent position
      const currentPosition = viewport.worldToViewport({
        x: x.get(),
        y: y.get(),
      });
      grabDisplacementRef.current = subtractVectors(currentPosition, screenPosition);
      const positionVector = displace(screenPosition);

      canvas.onObjectDragStart(positionVector, objectId, objectKind);
      autoPan.start(screenPosition);
      onDragStart?.();
    },
    onDragEnd: (state) => {
      if (isRightClick(state.event) || isMiddleClick(state.event)) {
        state.cancel();
        return;
      }

      const positionVector = displace({ x: state.xy[0], y: state.xy[1] });
      canvas.onObjectDragEnd(positionVector, objectId, objectKind);
      // we leave this flag on for a few ms - the "drag" gesture
      // basically has a fade-out effect where it continues to
      // block gestures internal to the drag handle for a bit even
      // after releasing
      setTimeout(() => {
        setIsGrabbing(false);
      }, 100);
      autoPan.stop();
      onDragEnd?.();
      grabDisplacementRef.current = { x: 0, y: 0 };
    },
  });

  return {
    style,
    bindDragHandle,
    pickupSpring,
    isGrabbing,
  };
}
