/**
 * ##WITH_EDIT
 *
 * Aug 28, 2020 WQP
 * - Add messaging for when there is not microphone access.
 */

import { LocalAudioTrack } from 'twilio-video';
import { useCallback, useState } from 'react';
import useIsTrackEnabled from '../useIsTrackEnabled/useIsTrackEnabled';
import useVideoContext from '../useVideoContext/useVideoContext';

export default function useLocalAudioToggle() {
  const {
    localTracks,
    getLocalAudioTrack,
    room: { localParticipant },
  } = useVideoContext();
  const audioTrack = localTracks.find((track) => track.kind === 'audio') as LocalAudioTrack;
  const isEnabled = useIsTrackEnabled(audioTrack);
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleAudioEnabled = useCallback(async () => {
    // prevent multiple concurrent publishes
    if (isPublishing) return;

    if (audioTrack) {
      audioTrack.isEnabled ? audioTrack.disable() : audioTrack.enable();
    } else {
      setIsPublishing(true);
      try {
        const track = await getLocalAudioTrack();
        localParticipant?.publishTrack(track, { priority: 'standard' });
      } catch (err) {
        // this error is already reported by the video context.
        // TODO: move the error handling here?
      } finally {
        setIsPublishing(false);
      }
    }
  }, [audioTrack, getLocalAudioTrack, localParticipant, isPublishing]);

  return [isEnabled, toggleAudioEnabled] as const;
}
