/**
 * ##WITH_EDIT
 *
 * Aug 28, 2020 WQP
 * - Add messaging for when there is not microphone access.
 */

import { LocalAudioTrack } from 'twilio-video';
import { useCallback } from 'react';
import useIsTrackEnabled from '../useIsTrackEnabled/useIsTrackEnabled';
import useVideoContext from '../useVideoContext/useVideoContext';

export default function useLocalAudioToggle() {
  const { localTracks, onError } = useVideoContext();
  const audioTrack = localTracks.find((track) => track.kind === 'audio') as LocalAudioTrack;
  const isEnabled = useIsTrackEnabled(audioTrack);

  const toggleAudioEnabled = useCallback(() => {
    if (audioTrack) {
      audioTrack.isEnabled ? audioTrack.disable() : audioTrack.enable();
    } else {
      // Assume that if there is no audio track permission has been denied and report an error.
      // VideoProvider automatically creates an audio track, so absense of a track means something bad happened or
      // that permission for microphones was denied.
      // @ts-ignore
      onError(new Error('Please grant microphone access to enable audio.'));
    }
  }, [audioTrack]);

  return [isEnabled, toggleAudioEnabled] as const;
}
