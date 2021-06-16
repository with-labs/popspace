import throttle from 'lodash.throttle';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import { Vector2 } from '../../types/spatials';
import client from '@api/client';

/**
 * Tracks cursor position and sends updates to the socket connection
 */
export function useTrackCursor() {
  const lastKnownPositionRef = useRef<Vector2>({ x: 0, y: 0 });

  const throttledUpdate = useMemo(() => throttle(client.passthrough.updateCursor, 500), []);

  const onMove = useCallback(
    (pos: Vector2) => {
      lastKnownPositionRef.current = pos;
      throttledUpdate({
        position: pos,
        active: true,
      });
    },
    [lastKnownPositionRef, throttledUpdate]
  );

  useEffect(() => {
    const handleWindowBlur = () => {
      client.passthrough.updateCursor({
        position: lastKnownPositionRef.current,
        active: false,
      });
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [lastKnownPositionRef]);

  return onMove;
}
