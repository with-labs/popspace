import React from 'react';
import { useLocalParticipant } from '../../hooks/useLocalParticipant/useLocalParticipant';
import { useNamedPublication } from '../../hooks/useNamedPublication/useNamedPublication';
import { CAMERA_TRACK_NAME } from '../../constants/User';
import Publication from '../Publication/Publication';

export default function LocalVideoPreview({ className }: { className?: string }) {
  const localParticipant = useLocalParticipant();
  const videoPub = useNamedPublication(localParticipant, CAMERA_TRACK_NAME);

  return videoPub ? <Publication publication={videoPub} isLocal classNames={className} /> : null;
}
