import { useEffect, useState } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
import { RoomState, RoomEvent } from '../../constants/twilio';

export default function useRoomState() {
  const { room } = useVideoContext();
  const [state, setState] = useState<RoomState>(RoomState.Disconnected);

  useEffect(() => {
    if (!room) return;

    const setRoomState = () => setState((room.state || RoomState.Disconnected) as RoomState);
    setRoomState();
    room
      .on(RoomEvent.Disconnected, setRoomState)
      .on(RoomEvent.Reconnected, setRoomState)
      .on(RoomEvent.Reconnecting, setRoomState);
    return () => {
      room
        .off(RoomEvent.Disconnected, setRoomState)
        .off(RoomEvent.Reconnected, setRoomState)
        .off(RoomEvent.Reconnecting, setRoomState);
    };
  }, [room]);

  return state;
}
