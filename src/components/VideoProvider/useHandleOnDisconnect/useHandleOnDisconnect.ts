import { useEffect } from 'react';
import { Room } from 'twilio-video';
import { Callback } from '../../../types/twilio';
import { RoomEvent } from '../../../constants/twilio';

export default function useHandleOnDisconnect(room: Room | null, onDisconnect: Callback) {
  useEffect(() => {
    if (!room) return;

    room.on(RoomEvent.Disconnected, onDisconnect);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnect);
    };
  }, [room, onDisconnect]);
}
