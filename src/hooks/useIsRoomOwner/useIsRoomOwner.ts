import { useRoomName } from '../useRoomName/useRoomName';
import { useCurrentUserProfile } from '../useCurrentUserProfile/useCurrentUserProfile';
import { useMemo } from 'react';

export function useIsRoomOwner() {
  const roomName = useRoomName();
  const { currentUserProfile } = useCurrentUserProfile();
  const isRoomOwner = useMemo(() => currentUserProfile?.rooms?.owned.some((room) => room.name === roomName), [
    currentUserProfile,
    roomName,
  ]);
  return isRoomOwner;
}
