import { useNamedPublication } from '../../twilio/hooks/useNamedPublication';
import { MIC_TRACK_NAME } from '../../../constants/User';
import { useLocalMediaToggle } from './useLocalMediaToggle';
import { useLocalParticipant } from '../../twilio/hooks/useLocalParticipant';
import { useLocalTracks } from './useLocalTracks';

export default function useLocalAudioToggle(isLocal?: boolean) {
  const { startAudio, stopAudio, audioTrack } = useLocalTracks();
  const audioPub = useNamedPublication(useLocalParticipant(), MIC_TRACK_NAME);
  const isPublished = isLocal ? audioTrack : audioPub;

  return useLocalMediaToggle(!!isPublished, startAudio, stopAudio);
}
