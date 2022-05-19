import { useCameraControl } from '@src/media/hooks';
import * as React from 'react';
import { CameraToggle } from './CameraToggle';

export const PublishedCameraToggle = () => {
  const { toggle, track, isPublishing } = useCameraControl();

  return <CameraToggle isVideoOn={!!track} toggleVideoOn={toggle} busy={isPublishing} />;
};
