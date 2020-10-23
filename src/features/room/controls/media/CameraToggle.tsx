import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { CameraOnIcon } from '../../../../withComponents/icons/CameraOnIcon';
import { CameraOffIcon } from '../../../../withComponents/icons/CameraOffIcon';
import useLocalVideoToggle from '../../../../hooks/useLocalVideoToggle/useLocalVideoToggle';

export const CameraToggle = (props: { className?: string }) => {
  const [isVideoOn, toggleVideoOn] = useLocalVideoToggle();

  return (
    <ToggleButton value="video" selected={isVideoOn} onChange={toggleVideoOn} {...props}>
      {isVideoOn ? <CameraOnIcon fontSize="default" /> : <CameraOffIcon fontSize="default" />}
    </ToggleButton>
  );
};
