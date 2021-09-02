import { useRoomStore } from '@api/useRoomStore';
import { useLocalStorage } from '@hooks/useLocalStorage/useLocalStorage';

export const useUserStats = () => {
  const roomId = useRoomStore((room) => room.id);

  return useLocalStorage('tilde_user_stats', {
    count: 0,
    lastRoom: roomId,
    date: '',
    completed: [] as string[],
  });
};
