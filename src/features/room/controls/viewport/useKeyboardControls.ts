import { Vector2 } from '../../../../types/spatials';
import { useRef, useEffect, useState, useCallback } from 'react';

const CONTROLLED_KEYS = ['=', '+', '-', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const PAN_SPEED = 1;
const ZOOM_SPEED = 0.001;

export function useKeyboardControls({ pan, zoom }: { zoom: (delta: number) => void; pan: (delta: Vector2) => void }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const { current: el } = elementRef;
    if (!el) return;

    if (isActive) {
      const activeKeys = new Set<string>();

      function handleKeyDown(ev: KeyboardEvent) {
        if (CONTROLLED_KEYS.includes(ev.key)) {
          ev.preventDefault();
          activeKeys.add(ev.key);
        }
      }
      function handleKeyUp(ev: KeyboardEvent) {
        if (CONTROLLED_KEYS.includes(ev.key)) {
          ev.preventDefault();
          activeKeys.delete(ev.key);
        }
      }

      el.addEventListener('keydown', handleKeyDown);
      el.addEventListener('keyup', handleKeyUp);

      // begin a loop which tracks delta time and applies it to
      // pan velocity for smooth panning regardless of framerate
      let lastFrameTime: number | null = null;
      let animationFrame: number | null = null;
      function loop() {
        const now = Date.now();
        const delta = lastFrameTime ? now - lastFrameTime : 0;
        lastFrameTime = now;

        if (activeKeys.has('=') || activeKeys.has('+')) {
          zoom(delta * ZOOM_SPEED);
        } else if (activeKeys.has('-')) {
          zoom(delta * -ZOOM_SPEED);
        }
        const xInput = activeKeys.has('ArrowLeft') ? -1 : activeKeys.has('ArrowRight') ? 1 : 0;
        const yInput = activeKeys.has('ArrowUp') ? -1 : activeKeys.has('ArrowDown') ? 1 : 0;
        const velocity = {
          x: delta * xInput * PAN_SPEED,
          y: delta * yInput * PAN_SPEED,
        };
        if (velocity.x !== 0 || velocity.y !== 0) {
          pan(velocity);
        }

        animationFrame = requestAnimationFrame(loop);
      }
      // start the loop
      animationFrame = requestAnimationFrame(loop);

      return () => {
        el.removeEventListener('keydown', handleKeyDown);
        el.removeEventListener('keyup', handleKeyUp);
        animationFrame && cancelAnimationFrame(animationFrame);
      };
    }
  }, [isActive, zoom, pan]);

  const handleFocus = useCallback(() => setIsActive(true), []);
  const handleBlur = useCallback(() => setIsActive(false), []);

  return {
    props: {
      tabIndex: 1,
      ref: elementRef,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    isActive,
  };
}
