import { useContext } from 'react';
import { RoomStateContext } from '../../withComponents/RoomState/RoomStateProvider';

export function useRoomStateContext() {
  const context = useContext(RoomStateContext);

  if (!context) {
    throw new Error('`useRoomStateContext` must be used within a RoomStateContext');
  }

  return context;
}
