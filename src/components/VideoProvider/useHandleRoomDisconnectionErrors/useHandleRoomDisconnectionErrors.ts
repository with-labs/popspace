import { Room, TwilioError } from 'twilio-video';
import { useEffect } from 'react';
import { Callback } from '../../../types/twilio';
import { RoomEvent } from '../../../constants/twilio';
import { logger } from '../../../utils/logger';
import { useTranslation } from 'react-i18next';

export default function useHandleRoomDisconnectionErrors(room: Room | null, onError: Callback) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!room) return;

    const onDisconnected = (_: Room, error: TwilioError) => {
      if (error) {
        logger.error(error);
        onError(new Error(t('error.messages.mediaUnavailable')));
      }
    };

    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room, onError, t]);
}
