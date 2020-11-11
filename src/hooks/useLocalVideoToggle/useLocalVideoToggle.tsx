import { useCallback, useRef } from 'react';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';

export default function useLocalVideoToggle() {
  const { videoTrack, startVideo, stopVideo } = useLocalTracks();
  const busyRef = useRef(false);

  const toggleVideoEnabled = useCallback(async () => {
    if (videoTrack) {
      stopVideo();
    } else {
      // prevent simultaneous invocation
      if (busyRef.current) return;

      busyRef.current = true;
      try {
        await startVideo();
      } finally {
        busyRef.current = false;
      }
    }
  }, [videoTrack, startVideo, stopVideo]);

  return [!!videoTrack, toggleVideoEnabled] as const;
}
