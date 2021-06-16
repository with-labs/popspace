import { useRef, useEffect, useCallback, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Viewport } from '@providers/viewport/Viewport';
import { Vector2 } from '@src/types/spatials';

const CONTROLLED_KEYS = ['=', '+', '-', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
const PAN_SPEED = 1;
const ZOOM_SPEED = 0.001;

export function useKeyboardControls(viewport: Viewport) {
  const elementRef = useRef<HTMLDivElement>(null);
  const activeKeysRef = useRef(new Set<string>());

  // global zoom default prevention - this is best-effort and not
  // guaranteed to work.
  useEffect(() => {
    const onGlobalKeyDown = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && (ev.key === '=' || ev.key === '-')) {
        ev.preventDefault();
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
    };
  }, []);

  const handleKeyDown = useCallback((ev: ReactKeyboardEvent<HTMLElement>) => {
    if (CONTROLLED_KEYS.includes(ev.key)) {
      ev.preventDefault();
      // ignoring presses with metaKey because of behavior with MacOS -
      // if meta key is down, keyup is never fired and the zoom never
      // ends.
      if (!ev.metaKey) {
        activeKeysRef.current.add(ev.key);
      }
    }
  }, []);

  const handleKeyUp = useCallback((ev: ReactKeyboardEvent<HTMLElement>) => {
    if (CONTROLLED_KEYS.includes(ev.key)) {
      ev.preventDefault();
      activeKeysRef.current.delete(ev.key);
    }
  }, []);

  useEffect(() => {
    const { current: el } = elementRef;
    if (!el) return;

    // begin a loop which tracks delta time and applies it to
    // pan velocity for smooth panning regardless of framerate
    let lastFrameTime: number | null = null;
    let animationFrame: number | null = null;

    // extracted to reduce memory allocation in tight loop
    const velocity: Vector2 = { x: 0, y: 0 };

    function loop() {
      const activeKeys = activeKeysRef.current;
      const now = Date.now();
      const delta = lastFrameTime ? now - lastFrameTime : 0;
      lastFrameTime = now;

      if (activeKeys.has('=') || activeKeys.has('+')) {
        viewport.doRelativeZoom(delta * ZOOM_SPEED, {
          origin: 'direct',
        });
      } else if (activeKeys.has('-')) {
        viewport.doRelativeZoom(delta * -ZOOM_SPEED, {
          origin: 'direct',
        });
      }
      const xInput = activeKeys.has('ArrowLeft') ? -1 : activeKeys.has('ArrowRight') ? 1 : 0;
      const yInput = activeKeys.has('ArrowUp') ? -1 : activeKeys.has('ArrowDown') ? 1 : 0;
      velocity.x = delta * xInput * PAN_SPEED;
      velocity.y = delta * yInput * PAN_SPEED;
      if (velocity.x !== 0 || velocity.y !== 0) {
        viewport.doRelativePan(velocity, {
          origin: 'direct',
        });
      }

      animationFrame = requestAnimationFrame(loop);
    }
    // start the loop
    animationFrame = requestAnimationFrame(loop);

    return () => {
      animationFrame && cancelAnimationFrame(animationFrame);
    };
  }, [viewport]);

  return {
    props: {
      tabIndex: 1,
      ref: elementRef,
      onKeyUp: handleKeyUp,
      onKeyDown: handleKeyDown,
    },
  };
}
