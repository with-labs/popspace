import { useIsMe } from '@api/useIsMe';
import { useEffect } from 'react';

import { useLocalMediaGroup } from '@src/media/useLocalMediaGroup';
import { CanvasObjectKind } from './Canvas';

export function useSyncLocalMediaGroup(objectId: string, objectKind: CanvasObjectKind, mediaGroup: string | null) {
  // sync the global state for the local client's media group
  // if this is the local client
  const isLocalUser = useIsMe(objectId) && objectKind === 'person';
  const setLocalMediaGroup = useLocalMediaGroup((store) => store.setLocalMediaGroup);

  useEffect(() => {
    if (isLocalUser) {
      setLocalMediaGroup(mediaGroup);
    }
  }, [mediaGroup, isLocalUser, setLocalMediaGroup]);
}
