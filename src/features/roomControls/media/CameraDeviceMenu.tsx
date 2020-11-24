import * as React from 'react';
import { useAVSources } from '../../../hooks/useAVSources/useAVSources';
import { useLocalTracks } from '../../../components/LocalTracksProvider/useLocalTracks';
import { Menu, MenuItem } from '@material-ui/core';
import { removeDeviceId } from './removeDeviceId';

export interface ICameraDeviceMenuProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

/**
 * Renders a menu with options to select a camera device
 */
export const CameraDeviceMenu: React.FC<ICameraDeviceMenuProps> = ({ open, onClose, anchorEl }) => {
  const { cameras, initialized } = useAVSources();
  const { cameraDeviceId, setCameraDeviceId } = useLocalTracks();
  const value = cameraDeviceId || cameras[0]?.deviceId || null;

  // wait for devices to load before opening
  const finalOpen = open && initialized;

  return (
    <Menu open={finalOpen} onClose={onClose} anchorEl={anchorEl}>
      {cameras.map((cam) => (
        <MenuItem
          value={cam.deviceId}
          key={cam.deviceId}
          selected={cam.deviceId === value}
          onClick={() => {
            setCameraDeviceId(cam.deviceId);
            onClose();
          }}
        >
          {removeDeviceId(cam.label)}
        </MenuItem>
      ))}
    </Menu>
  );
};
