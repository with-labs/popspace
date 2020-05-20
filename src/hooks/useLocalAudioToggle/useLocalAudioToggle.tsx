/**
 * #ANGLES_EDIT
 *
 * 5/18/2020 WQP: Base audio track enabledment on presence/publication of an audio track.
 */

import { LocalAudioTrack } from 'twilio-video';
import { useCallback } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';

export default function useLocalAudioToggle() {
  const {
    localTracks,
    getLocalAudioTrack,
    room: { localParticipant },
  } = useVideoContext();
  const audioTrack = localTracks.find(track => track.kind === 'audio') as LocalAudioTrack;
  const { activeMicId } = useParticipantMeta(localParticipant);

  const toggleAudioEnabled = useCallback(() => {
    if (audioTrack) {
      if (localParticipant) {
        const localTrackPublication = localParticipant.unpublishTrack(audioTrack);
        // TODO: remove when SDK implements this event. See: https://issues.corp.twilio.com/browse/JSDK-2592
        localParticipant.emit('trackUnpublished', localTrackPublication);
      }
      audioTrack.stop();
    } else {
      getLocalAudioTrack(activeMicId || '').then((track: LocalAudioTrack) => {
        if (localParticipant) {
          localParticipant.publishTrack(track);
        }
      });
    }
  }, [audioTrack, activeMicId, localParticipant, getLocalAudioTrack]);

  return [!!audioTrack, toggleAudioEnabled] as const;
}
