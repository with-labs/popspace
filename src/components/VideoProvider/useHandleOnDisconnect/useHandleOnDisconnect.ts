import { useEffect } from 'react';
import { Room } from 'twilio-video';
import { Callback } from '../../../types/twilio';

export default function useHandleOnDisconnect(room: Room | null, onDisconnect: Callback) {
  useEffect(() => {
    if (!room) return;

    room.on('disconnected', onDisconnect);
    return () => {
      room.off('disconnected', onDisconnect);
    };
  }, [room, onDisconnect]);
}
