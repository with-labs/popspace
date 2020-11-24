import * as React from 'react';
import { useAVSources } from '../../../hooks/useAVSources/useAVSources';
import { useLocalTracks } from '../../../components/LocalTracksProvider/useLocalTracks';
import { Menu, MenuItem } from '@material-ui/core';
import { removeDeviceId } from './removeDeviceId';

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
    <Menu open={finalOpen} onClose={onClose} anchorEl={anchorEl}>
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
          {removeDeviceId(mic.label)}
        </MenuItem>
      ))}
    </Menu>
  );
};
