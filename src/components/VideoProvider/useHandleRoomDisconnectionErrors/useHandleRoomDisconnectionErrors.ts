import { Room, TwilioError } from 'twilio-video';
import { useEffect } from 'react';
import { Callback } from '../../../types/twilio';
import * as Sentry from '@sentry/react';

export default function useHandleRoomDisconnectionErrors(room: Room | null, onError: Callback) {
  useEffect(() => {
    if (!room) return;

    const onDisconnected = (_: Room, error: TwilioError) => {
      if (error) {
        Sentry.captureEvent(error);
        onError(error);
      }
    };

    room.on('disconnected', onDisconnected);
    return () => {
      room.off('disconnected', onDisconnected);
    };
  }, [room, onError]);
}
