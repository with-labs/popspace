import React from 'react';
import { useNamedPublication } from '@providers/twilio/hooks/useNamedPublication';
import { CAMERA_TRACK_NAME } from '@constants/User';
import Publication from '../Publication/Publication';
import { useLocalParticipant } from '@providers/twilio/hooks/useLocalParticipant';

export default function LocalVideoPreview({ className }: { className?: string }) {
  const localParticipant = useLocalParticipant();
  const videoPub = useNamedPublication(localParticipant, CAMERA_TRACK_NAME);

  return videoPub ? <Publication publication={videoPub} isLocal classNames={className} /> : null;
}
