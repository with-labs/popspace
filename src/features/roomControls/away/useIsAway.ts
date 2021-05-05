import { useCallback } from 'react';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { EventNames } from '../../../analytics/constants';
import { useAnalytics, IncludeData } from '../../../hooks/useAnalytics/useAnalytics';

export function useIsAway() {
  const { trackEvent } = useAnalytics([IncludeData.roomId]);

  const isAway = useRoomStore(
    useCallback(
      (room) => !!(room.sessionId && room.users[room.sessionLookup[room.sessionId]]?.participantState?.isAway),
      []
    )
  );
  const updateSelf = useRoomStore((room) => room.api.updateSelf);
  const setAway = useCallback(
    (val: boolean) => {
      trackEvent(EventNames.TOGGLED_STEPAWAY, {
        isAway: val,
        timestamp: new Date().getTime(),
      });
      updateSelf({ isAway: val });
    },
    [updateSelf, trackEvent]
  );
  return [isAway, setAway] as const;
}
