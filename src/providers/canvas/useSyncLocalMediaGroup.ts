import { useEffect } from 'react';
import { useLocalMediaGroup } from '../media/useLocalMediaGroup';
import { useIsMe } from '@api/useIsMe';

export function useSyncLocalMediaGroup(objectId: string, mediaGroup: string | null) {
  // sync the global state for the local client's media group
  // if this is the local client
  const isLocalUser = useIsMe(objectId);
  const setLocalMediaGroup = useLocalMediaGroup((store) => store.setLocalMediaGroup);

  useEffect(() => {
    if (isLocalUser) {
      setLocalMediaGroup(mediaGroup);
    }
  }, [mediaGroup, isLocalUser, setLocalMediaGroup]);
}
