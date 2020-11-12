import { useCallback, useRef } from 'react';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';

export default function useLocalAudioToggle() {
  const { audioTrack, startAudio, stopAudio } = useLocalTracks();
  const busyRef = useRef(false);

  const toggleAudioEnabled = useCallback(async () => {
    if (audioTrack) {
      stopAudio();
    } else {
      // prevent simultaneous invocation
      if (busyRef.current) return;

      busyRef.current = true;
      try {
        await startAudio();
      } finally {
        busyRef.current = false;
      }
    }
  }, [audioTrack, startAudio, stopAudio]);

  return [!!audioTrack, toggleAudioEnabled] as const;
}
