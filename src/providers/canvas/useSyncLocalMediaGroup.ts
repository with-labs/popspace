import { useEffect } from 'react';
import { useRoomStore } from '@roomState/useRoomStore';
import { useLocalMediaGroup } from '../media/useLocalMediaGroup';

export function useSyncLocalMediaGroup(objectId: string, mediaGroup: string | null) {
  // sync the global state for the local client's media group
  // if this is the local client
  const localUserId = useRoomStore((room) => room.api.getActiveUserId());
  const isLocalUser = objectId === localUserId;
  const setLocalMediaGroup = useLocalMediaGroup((store) => store.setLocalMediaGroup);

  useEffect(() => {
    if (isLocalUser) {
      setLocalMediaGroup(mediaGroup);
    }
  }, [mediaGroup, isLocalUser, setLocalMediaGroup]);
}
