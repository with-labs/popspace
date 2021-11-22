import { useNamedPublication } from '../../twilio/hooks/useNamedPublication';
import { MIC_TRACK_NAME } from '@constants/User';
import { useLocalMediaToggle } from './useLocalMediaToggle';
import { useLocalParticipant } from '../../twilio/hooks/useLocalParticipant';
import { useLocalTracks } from './useLocalTracks';

export default function usePublishedAudioToggle(isLocal?: boolean) {
  const { startAudio, stopAudio } = useLocalTracks();
  const audioPub = useNamedPublication(useLocalParticipant(), MIC_TRACK_NAME);

  return useLocalMediaToggle(!!audioPub, startAudio, stopAudio);
}
