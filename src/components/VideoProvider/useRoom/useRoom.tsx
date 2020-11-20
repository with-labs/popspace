import { useCallback, useState } from 'react';
import Video, { ConnectOptions, Room } from 'twilio-video';
import { Callback } from '../../../types/twilio';

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
        newRoom.once('disconnected', () => {
          // Reset the room only after all other `disconnected` listeners have been called.
          setTimeout(() => setRoom(null));
          window.removeEventListener('beforeunload', handleUnload);
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
