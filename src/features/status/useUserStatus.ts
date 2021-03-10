import { useCallback } from 'react';
import { STATUS_HISTORY } from '../../constants/User';
import { useLocalStorage } from '../../hooks/useLocalStorage/useLocalStorage';
import { useRoomStore } from '../../roomState/useRoomStore';

const MAX_HISTORY = 3;

type StatusData = {
  emoji: string | null;
  statusText: string;
};

export function useUserStatus() {
  const userInfo = useRoomStore(useCallback((room) => room.users[room.sessionLookup[room.sessionId || '']], []));
  const updateSelf = useRoomStore((room) => room.api.updateSelf);

  const emoji = userInfo?.participantState.emoji;
  const statusText = userInfo?.participantState.statusText || '';

  const [statusHistory, setStatusHistory] = useLocalStorage<StatusData[]>(STATUS_HISTORY, []);

  const set = (newStatus: { emoji: string | null; statusText: string } | null) => {
    updateSelf({
      statusText: newStatus?.statusText,
      emoji: newStatus?.emoji ?? null,
    });

    // emoji-only statuses aren't saved in history; emoji picker should suggest
    // recent emoji anyway
    if (!newStatus || !newStatus.statusText) return;

    // filter duplicates
    if (
      statusHistory
        .map((history) => `${history.emoji}${history.statusText}`)
        .includes(`${newStatus?.emoji}${newStatus?.statusText}`)
    )
      return;

    // replace a previous status with the same text if only the emoji has changed
    const sameTextIndex = statusHistory.findIndex((item) => item.statusText === newStatus.statusText);
    if (sameTextIndex >= 0) {
      statusHistory[sameTextIndex] = newStatus;
      setStatusHistory([...statusHistory]);
    } else {
      // otherwise prepend it and slice to max size
      const history = [newStatus, ...statusHistory].slice(0, MAX_HISTORY);
      setStatusHistory(history);
    }
  };

  return {
    status: {
      emoji,
      statusText,
    },
    set,
    history: statusHistory,
  };
}
