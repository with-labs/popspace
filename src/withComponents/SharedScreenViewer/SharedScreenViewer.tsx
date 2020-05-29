import React from 'react';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
import useParticipants from '../../hooks/useParticipants/useParticipants';

import { ScreenViewModal } from './ScreenViewModal';

export const SharedScreenViewer: React.FC<{}> = () => {
  const { room } = useVideoContext();
  const { localParticipant } = room;
  const participants = useParticipants();

  const { viewingScreenSid } = useParticipantMeta(localParticipant);

  // According to the rules-of-hooks, hooks cannot be called conditionally. Therefore, we must find the screen sharing
  // participant and then conditionally render the viewer modal. The viewer modal will handle getting the
  // sharing participant's publications and rendering of the modal and screen share video stream.
  const screenViewPt = participants.find(pt => pt.sid === viewingScreenSid);

  return screenViewPt ? <ScreenViewModal participant={screenViewPt} /> : null;
};
