import * as React from 'react';
import { useAVSources } from '@hooks/useAVSources/useAVSources';
import { MenuItem } from '@material-ui/core';
import { ResponsiveMenu } from '@components/ResponsiveMenu/ResponsiveMenu';
import { useLocalTracks } from '@providers/media/hooks/useLocalTracks';

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
    <ResponsiveMenu open={finalOpen} onClose={onClose} anchorEl={anchorEl}>
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
          {cam.label}
        </MenuItem>
      ))}
    </ResponsiveMenu>
  );
};
