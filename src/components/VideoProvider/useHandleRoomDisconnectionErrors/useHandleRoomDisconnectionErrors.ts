import { Room, TwilioError } from 'twilio-video';
import { useEffect } from 'react';
import { Callback } from '../../../types/twilio';
import { RoomEvent } from '../../../constants/twilio';
import { logger } from '../../../utils/logger';

export default function useHandleRoomDisconnectionErrors(room: Room | null, onError: Callback) {
  useEffect(() => {
    if (!room) return;

    const onDisconnected = (_: Room, error: TwilioError) => {
      if (error) {
        logger.info(error);
        onError(error);
      }
    };

    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room, onError]);
}
