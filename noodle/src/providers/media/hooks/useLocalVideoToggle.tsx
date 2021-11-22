import { useLocalMediaToggle } from './useLocalMediaToggle';
import { useLocalTracks } from './useLocalTracks';

export default function useLocalVideoToggle() {
  const { startVideo, stopVideo, videoTrack } = useLocalTracks();
  return useLocalMediaToggle(!!videoTrack, startVideo, stopVideo);
}
