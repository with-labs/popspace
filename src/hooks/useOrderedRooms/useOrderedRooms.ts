import { useEffect, useMemo } from 'react';
import { logger } from '../../utils/logger';
import { UserProfile } from '../api/useCurrentUserProfile';
import { useDefaultRoom } from '../api/useDefaultRoom';

export function useOrderedRooms(profile?: UserProfile) {
  const { rooms: { owned, member } = { owned: [], member: [] } } = profile || {};
  const { data: defaultRoomRoute, error, isLoading } = useDefaultRoom();
  useEffect(() => {
    if (error) {
      logger.error(`Failed to get default room for user ${profile?.user.id}`, error);
    }
    // disable deps check; for debug error reporting only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);
  return useMemo(() => {
    const allRooms = [...owned, ...member];
    if (defaultRoomRoute) {
      const defaultIndex = allRooms.findIndex((room) => room.route === defaultRoomRoute);
      if (defaultIndex !== -1) {
        const [defaultRoom] = allRooms.splice(defaultIndex, 1);
        allRooms.unshift(defaultRoom);
      }
    }
    return { rooms: allRooms, isLoading };
  }, [owned, member, defaultRoomRoute, isLoading]);
}
