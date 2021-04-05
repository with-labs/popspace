import { CAMERA_TRACK_NAME } from '../../../constants/User';
import { useLocalParticipant } from '../../twilio/hooks/useLocalParticipant';
import { useNamedPublication } from '../../twilio/hooks/useNamedPublication';
import { useLocalMediaToggle } from './useLocalMediaToggle';
import { useLocalTracks } from './useLocalTracks';

export default function useLocalVideoToggle(isLocal?: boolean) {
  const { startVideo, stopVideo, videoTrack } = useLocalTracks();
  const videoPub = useNamedPublication(useLocalParticipant(), CAMERA_TRACK_NAME);
  const isPublished = isLocal ? videoTrack : videoPub;

  return useLocalMediaToggle(!!isPublished, startVideo, stopVideo);
}
