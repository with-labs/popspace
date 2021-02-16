import { useCallback } from 'react';
import { useRoomStore } from '../../../roomState/useRoomStore';

export function useIsAway() {
  const isAway = useRoomStore(
    useCallback(
      (room) => !!(room.sessionId && room.users[room.sessionLookup[room.sessionId]]?.participantState?.isAway),
      []
    )
  );
  const updateSelf = useRoomStore((room) => room.api.updateSelf);
  const setAway = useCallback((val: boolean) => updateSelf({ isAway: val }), [updateSelf]);
  return [isAway, setAway] as const;
}
