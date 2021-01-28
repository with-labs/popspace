import { useRoomName } from '../useRoomName/useRoomName';
import { useCurrentUserProfile } from '../useCurrentUserProfile/useCurrentUserProfile';
import { useMemo } from 'react';

export function useIsRoomOwner() {
  const roomName = useRoomName();
  const { profile: currentUserProfile } = useCurrentUserProfile();
  const isRoomOwner = useMemo(() => {
    const owned = currentUserProfile?.rooms?.owned ?? [];
    return owned.some((room) => room.name === roomName);
  }, [currentUserProfile, roomName]);
  return isRoomOwner;
}
