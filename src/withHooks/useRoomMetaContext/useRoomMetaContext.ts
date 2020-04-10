import { useContext } from 'react';

import { RoomMetaContext } from '../../withComponents/RoomMetaProvider/RoomMetaProvider';

export function useRoomMetaContext() {
  const context = useContext(RoomMetaContext);

  if (!context) {
    throw new Error('useRoomMeta Context must be used inside a RoomMetaContext');
  }

  return context;
}
