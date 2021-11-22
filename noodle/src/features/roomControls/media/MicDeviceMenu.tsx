import * as React from 'react';
import { useAVSources } from '@hooks/useAVSources/useAVSources';
import { MenuItem } from '@material-ui/core';
import { ResponsiveMenu } from '@components/ResponsiveMenu/ResponsiveMenu';
import { useLocalTracks } from '@providers/media/hooks/useLocalTracks';

export interface IMicDeviceMenuProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

/**
 * Renders a menu with options to select a microphone device
 */
export const MicDeviceMenu: React.FC<IMicDeviceMenuProps> = ({ open, onClose, anchorEl }) => {
  const { mics, initialized } = useAVSources();
  const { micDeviceId, setMicDeviceId } = useLocalTracks();
  const value = micDeviceId || mics[0]?.deviceId || null;

  // wait for devices to load before opening
  const finalOpen = open && initialized;

  return (
    <ResponsiveMenu open={finalOpen} onClose={onClose} anchorEl={anchorEl}>
      {mics.map((mic) => (
        <MenuItem
          value={mic.deviceId}
          key={mic.deviceId}
          selected={mic.deviceId === value}
          onClick={() => {
            setMicDeviceId(mic.deviceId);
            onClose();
          }}
        >
          {mic.label}
        </MenuItem>
      ))}
    </ResponsiveMenu>
  );
};
