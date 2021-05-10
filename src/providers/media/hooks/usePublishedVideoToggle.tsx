import { CAMERA_TRACK_NAME } from '../../../constants/User';
import { useLocalParticipant } from '../../twilio/hooks/useLocalParticipant';
import { useNamedPublication } from '../../twilio/hooks/useNamedPublication';
import { useLocalMediaToggle } from './useLocalMediaToggle';
import { useLocalTracks } from './useLocalTracks';

export default function usePublishedVideoToggle() {
  const { startVideo, stopVideo } = useLocalTracks();
  const videoPub = useNamedPublication(useLocalParticipant(), CAMERA_TRACK_NAME);
  return useLocalMediaToggle(!!videoPub, startVideo, stopVideo);
}
