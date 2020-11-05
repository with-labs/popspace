import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { useCallback } from 'react';
import { actions } from '../../room/roomSlice';

export function useRoomImport() {
  const coordinatedDispatch = useCoordinatedDispatch();

  return useCallback(
    (data: any) => {
      coordinatedDispatch(actions.importRoom(data));
    },
    [coordinatedDispatch]
  );
}
