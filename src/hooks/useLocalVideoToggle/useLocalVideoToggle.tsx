import { useCallback } from 'react';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';

export default function useLocalVideoToggle() {
  const { videoTrack, startVideo, stopVideo } = useLocalTracks();

  const toggleVideoEnabled = useCallback(async () => {
    if (videoTrack) {
      stopVideo();
    } else {
      await startVideo();
    }
  }, [videoTrack, startVideo, stopVideo]);

  return [!!videoTrack, toggleVideoEnabled] as const;
}
