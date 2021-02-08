import { useCallback, useState } from 'react';
import { ConnectOptions, Room } from 'twilio-video';
import { Callback } from '../../../types/twilio';
import { logger } from '../../../utils/logger';
import { ReconnectingTwilioRoom } from '../ReconnectingTwilioRoom';

export default function useRoom(onError: Callback, options?: ConnectOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(
    async (roomName: string) => {
      setIsConnecting(true);
      try {
        logger.debug(`Connecting to room`);

        const connection = new ReconnectingTwilioRoom(roomName, { ...options, tracks: [] });
        connection.on('error', onError);
        connection.on('connected', setRoom);
        connection.on('disconnected', () => {
          setRoom(null);
        });

        await connection.connect();
      } catch (error) {
        onError(error);
        return null;
      } finally {
        setIsConnecting(false);
      }
    },
    [options, onError]
  );

  return { room, isConnecting, connect };
}
