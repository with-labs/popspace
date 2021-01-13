import { useRoomName } from '../useRoomName/useRoomName';
import { useCurrentUserProfile } from '../useCurrentUserProfile/useCurrentUserProfile';
import { useMemo } from 'react';

export function useIsRoomOwner() {
  const roomName = useRoomName();
  const { profile: currentUserProfile } = useCurrentUserProfile();
  const owned = currentUserProfile?.rooms?.owned ?? [];
  const isRoomOwner = useMemo(() => owned.some((room) => room.name === roomName), [owned, roomName]);
  return isRoomOwner;
}
