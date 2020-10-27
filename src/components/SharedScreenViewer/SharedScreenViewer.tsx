import React from 'react';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipants from '../../hooks/useParticipants/useParticipants';

import { ScreenViewModal } from './ScreenViewModal';
import { useSelector } from 'react-redux';
import { selectors } from '../../features/room/roomSlice';

export const SharedScreenViewer: React.FC<{}> = () => {
  const { room } = useVideoContext();
  const { localParticipant } = room;
  const participants = useParticipants();

  const viewingScreenSid = useSelector(selectors.createPersonScreenViewSidSelector(localParticipant.sid));

  // According to the rules-of-hooks, hooks cannot be called conditionally. Therefore, we must find the screen sharing
  // participant and then conditionally render the viewer modal. The viewer modal will handle getting the
  // sharing participant's publications and rendering of the modal and screen share video stream.
  const screenViewPt = participants.find((pt) => pt.sid === viewingScreenSid);

  return screenViewPt ? <ScreenViewModal participant={screenViewPt} /> : null;
};
