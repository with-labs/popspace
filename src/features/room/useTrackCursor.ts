import throttle from 'lodash.throttle';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useRoomStore } from '@roomState/useRoomStore';
import { Vector2 } from '../../types/spatials';

/**
 * Tracks cursor position and sends updates to the socket connection
 */
export function useTrackCursor() {
  const lastKnownPositionRef = useRef<Vector2>({ x: 0, y: 0 });

  const update = useRoomStore((room) => room.api.updateCursor);
  const throttledUpdate = useMemo(() => throttle(update, 500), [update]);

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
      update({
        position: lastKnownPositionRef.current,
        active: false,
      });
    };
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [update, lastKnownPositionRef]);

  return onMove;
}
