/**
 * #ANGLES_EDIT
 *
 * 5/18/2020 WQP: Base audio track enabledment on presence/publication of an audio track.
 */

import { LocalAudioTrack, TwilioError } from 'twilio-video';
import { useCallback } from 'react';
import useVideoContext from '../useVideoContext/useVideoContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
import { useAppState } from '../../state';

export default function useLocalAudioToggle() {
  const {
    localTracks,
    getLocalAudioTrack,
    room: { localParticipant },
  } = useVideoContext();
  const { setError } = useAppState();
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
      getLocalAudioTrack(activeMicId || '')
        .then((track: LocalAudioTrack) => {
          if (localParticipant) {
            localParticipant.publishTrack(track);
          }
        })
        .catch(err => {
          if (err?.message === 'Permission denied') {
            setError(
              new Error('To use your microphone, please grant this application microphone access.') as TwilioError
            );
          }
        });
    }
  }, [audioTrack, activeMicId, localParticipant, getLocalAudioTrack]);

  return [!!audioTrack, toggleAudioEnabled] as const;
}
