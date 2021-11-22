import { useEffect } from 'react';
import { isMobile } from '@utils/environment';
import { ReconnectingTwilioRoom } from './ReconnectingTwilioRoom';

/**
 * On mobile devices, media streams are automatically cut off when the
 * browser is backgrounded. This hook also disconnects the stream in
 * Twilio to ensure correctness.
 *
 * TODO: we may want to automatically republish the track when the user
 * returns to the app - but for now the user may do that manually.
 */
export function useMobileBackgroundDisconnect(connection: ReconnectingTwilioRoom) {
  useEffect(() => {
    if (isMobile()) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          connection.room?.localParticipant.videoTracks.forEach((track) => {
            track.unpublish();
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [connection]);
}
