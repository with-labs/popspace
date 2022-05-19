import * as React from 'react';
import { MenuItem } from '@material-ui/core';
import { ResponsiveMenu } from '@components/ResponsiveMenu/ResponsiveMenu';
import { useMediaDevices, usePreferredCameraDeviceId } from '@src/media/hooks';
import { TrackType } from '@withso/pop-media-sdk';
import { media } from '@src/media';

export interface ICameraDeviceMenuProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

/**
 * Renders a menu with options to select a camera device
 */
export const CameraDeviceMenu: React.FC<ICameraDeviceMenuProps> = ({ open, onClose, anchorEl }) => {
  const cameraDeviceId = usePreferredCameraDeviceId();
  const { devices: cameras } = useMediaDevices(TrackType.Camera);
  const value = cameraDeviceId || cameras[0]?.deviceId || null;

  return (
    <ResponsiveMenu open={open} onClose={onClose} anchorEl={anchorEl}>
      {cameras.map((cam) => (
        <MenuItem
          value={cam.deviceId}
          key={cam.deviceId}
          selected={cam.deviceId === value}
          onClick={() => {
            media.setPreferredCameraDeviceId(cam.deviceId);
            onClose();
          }}
        >
          {cam.label}
        </MenuItem>
      ))}
    </ResponsiveMenu>
  );
};
