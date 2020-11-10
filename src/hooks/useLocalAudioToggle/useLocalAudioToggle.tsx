import { useCallback } from 'react';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';

export default function useLocalAudioToggle() {
  const { audioTrack, startAudio, stopAudio } = useLocalTracks();

  const toggleAudioEnabled = useCallback(async () => {
    if (audioTrack) {
      stopAudio();
    } else {
      await startAudio();
    }
  }, [audioTrack, startAudio, stopAudio]);

  return [!!audioTrack, toggleAudioEnabled] as const;
}
