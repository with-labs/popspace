import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { CameraOnIcon } from '../../../components/icons/CameraOnIcon';
import { CameraOffIcon } from '../../../components/icons/CameraOffIcon';
import useLocalVideoToggle from '../../../hooks/useLocalVideoToggle/useLocalVideoToggle';

export const CameraToggle = (props: { className?: string }) => {
  const [isVideoOn, toggleVideoOn] = useLocalVideoToggle();

  return (
    <ToggleButton value="video" selected={isVideoOn} onChange={toggleVideoOn} {...props}>
      {isVideoOn ? <CameraOnIcon fontSize="default" /> : <CameraOffIcon fontSize="default" />}
    </ToggleButton>
  );
};
