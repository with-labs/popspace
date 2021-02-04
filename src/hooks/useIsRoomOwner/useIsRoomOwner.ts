import { useRoomRoute } from '../useRoomRoute/useRoomRoute';
import { useCurrentUserProfile } from '../useCurrentUserProfile/useCurrentUserProfile';
import { useMemo } from 'react';
import { RoomInfo } from '../../types/api';

export function useIsRoomOwner(roomRoute?: string) {
  // pull the current route from the url
  const currentRoute = useRoomRoute();
  // if a roomRoute is passed in to the hook, have it take priority
  const route = roomRoute || currentRoute;
  const { profile: currentUserProfile } = useCurrentUserProfile();
  const isRoomOwner = useMemo(() => {
    const owned = currentUserProfile?.rooms?.owned ?? [];
    return owned.some((room: RoomInfo) => room.route === route);
  }, [currentUserProfile, route]);
  return isRoomOwner;
}
