import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';
import { useNamedPublication } from '../useNamedPublication/useNamedPublication';
import { useLocalParticipant } from '../useLocalParticipant/useLocalParticipant';
import { MIC_TRACK_NAME } from '../../constants/User';
import { useLocalMediaToggle } from './useLocalMediaToggle';

export default function useLocalAudioToggle(isLocal?: boolean) {
  const { startAudio, stopAudio, audioTrack } = useLocalTracks();
  const audioPub = useNamedPublication(useLocalParticipant(), MIC_TRACK_NAME);
  const isPublished = isLocal ? audioTrack : audioPub;

  return useLocalMediaToggle(!!isPublished, startAudio, stopAudio);
}
