import { Room } from 'twilio-video';
import { useEffect } from 'react';

import { Callback } from '../../../types/twilio';

export default function useHandleTrackPublicationFailed(room: Room, onError: Callback) {
  const { localParticipant } = room;
  useEffect(() => {
    if (localParticipant) {
      localParticipant.on('trackPublicationFailed', onError);
      return () => {
        localParticipant.off('trackPublicationFailed', onError);
      };
    }
  }, [localParticipant, onError]);
}
