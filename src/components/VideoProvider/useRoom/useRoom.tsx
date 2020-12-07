import { useCallback, useState } from 'react';
import Video, { ConnectOptions, Room } from 'twilio-video';
import { Callback } from '../../../types/twilio';
import { logger } from '../../../utils/logger';
import { RoomEvent } from '../../../constants/twilio';

const LOG_BREADCRUMB_CATEGORY = 'twilio';

export default function useRoom(onError: Callback, options?: ConnectOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(
    async (token) => {
      setIsConnecting(true);
      try {
        const newRoom = await Video.connect(token, { ...options, tracks: [] });
        // some reasonably large number - we subscribe in many places.
        // FIXME: reduce number of subscriptions by moving them up into context state
        // instead of directly in hook
        newRoom.setMaxListeners(40);
        setRoom(newRoom);

        const handleUnload = () => newRoom.disconnect();
        newRoom.once(RoomEvent.Disconnected, () => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Room disconnected',
            data: {
              roomSid: newRoom.sid,
            },
          });
          // Reset the room only after all other `disconnected` listeners have been called.
          setTimeout(() => setRoom(null));
          window.removeEventListener('beforeunload', handleUnload);
        });

        newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Participant connected',
            data: {
              roomSid: newRoom.sid,
              participantSid: participant?.sid,
            },
          });
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Participant disconnected',
            data: {
              roomSid: newRoom.sid,
              participantSid: participant?.sid,
            },
          });
        });

        newRoom.on(RoomEvent.ParticipantReconnected, (participant) => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Participant reconnected',
            data: {
              roomSid: newRoom.sid,
              participantSid: participant?.sid,
            },
          });
        });

        newRoom.on(RoomEvent.ParticipantReconnecting, (participant) => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Participant reconnecting',
            data: {
              roomSid: newRoom.sid,
              participantSid: participant?.sid,
            },
          });
        });

        newRoom.on(RoomEvent.Reconnected, () => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Reconnected',
            data: {
              roomSid: newRoom.sid,
            },
          });
        });

        newRoom.on(RoomEvent.Reconnecting, () => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Reconnecting',
            data: {
              roomSid: newRoom.sid,
            },
          });
        });

        newRoom.on(RoomEvent.TrackPublished, (pub, participant) => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Track published',
            data: {
              roomSid: newRoom.sid,
              trackSid: pub?.trackSid,
              trackName: pub?.trackName,
              participantSid: participant?.sid,
            },
          });
        });

        newRoom.on(RoomEvent.TrackUnpublished, (pub, participant) => {
          logger.breadcrumb({
            category: LOG_BREADCRUMB_CATEGORY,
            message: 'Track unpublished',
            data: {
              roomSid: newRoom.sid,
              trackSid: pub?.trackSid,
              trackName: pub?.trackName,
              participantSid: participant?.sid,
            },
          });
        });

        // @ts-ignore
        window.twilioRoom = newRoom;
        setIsConnecting(false);

        // Add a listener to disconnect from the room when a user closes their browser
        window.addEventListener('beforeunload', handleUnload);

        return newRoom;
      } catch (error) {
        onError(error);
        setIsConnecting(false);
        return null;
      }
    },
    [options, onError]
  );

  return { room, isConnecting, connect };
}
