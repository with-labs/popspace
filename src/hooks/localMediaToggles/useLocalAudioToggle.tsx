import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';
import { useNamedPublication } from '../useNamedPublication/useNamedPublication';
import { useLocalParticipant } from '../useLocalParticipant/useLocalParticipant';
import { MIC_TRACK_NAME } from '../../constants/User';
import { useLocalMediaToggle } from './useLocalMediaToggle';

export default function useLocalAudioToggle() {
  const { startAudio, stopAudio } = useLocalTracks();
  const audioPub = useNamedPublication(useLocalParticipant(), MIC_TRACK_NAME);
  return useLocalMediaToggle(audioPub, startAudio, stopAudio);
}
