import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import useLocalAudioToggle from '../../../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import { MicOnIcon } from '../../../../components/icons/MicOnIcon';
import { MicOffIcon } from '../../../../components/icons/MicOffIcon';

export const MicToggle = (props: { className?: string }) => {
  const [isMicOn, toggleMicOn] = useLocalAudioToggle();

  return (
    <ToggleButton value="mic" selected={isMicOn} onChange={toggleMicOn} {...props}>
      {isMicOn ? <MicOnIcon fontSize="default" /> : <MicOffIcon fontSize="default" color="error" />}
    </ToggleButton>
  );
};
