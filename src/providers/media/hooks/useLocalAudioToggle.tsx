import { useLocalMediaToggle } from './useLocalMediaToggle';
import { useLocalTracks } from './useLocalTracks';

export default function useLocalAudioToggle(isLocal?: boolean) {
  const { startAudio, stopAudio, audioTrack } = useLocalTracks();
  return useLocalMediaToggle(!!audioTrack, startAudio, stopAudio);
}
