import * as React from 'react';
import { CameraToggle } from './CameraToggle';
import usePublishedVideoToggle from '../../../providers/media/hooks/usePublishedVideoToggle';
import { useRoomStatus } from '../../../providers/twilio/hooks/useRoomStatus';
import { TwilioStatus } from '../../../providers/twilio/TwilioProvider';

export const PublishedCameraToggle = () => {
  const [isVideoOn, toggleVideoOn, isVideoBusy] = usePublishedVideoToggle();
  const roomStatus = useRoomStatus();

  return (
    <CameraToggle
      isVideoOn={isVideoOn}
      toggleVideoOn={toggleVideoOn}
      busy={isVideoBusy || roomStatus !== TwilioStatus.Connected}
    />
  );
};
