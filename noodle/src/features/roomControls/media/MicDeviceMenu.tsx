import * as React from 'react';
import { MenuItem } from '@material-ui/core';
import { ResponsiveMenu } from '@components/ResponsiveMenu/ResponsiveMenu';
import { useMediaDevices, usePreferredMicrophoneDeviceId } from '@src/media/hooks';
import { TrackType } from '@withso/pop-media-sdk';
import { media } from '@src/media';

export interface IMicDeviceMenuProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

/**
 * Renders a menu with options to select a microphone device
 */
export const MicDeviceMenu: React.FC<IMicDeviceMenuProps> = ({ open, onClose, anchorEl }) => {
  const { devices: mics } = useMediaDevices(TrackType.Microphone);
  const micDeviceId = usePreferredMicrophoneDeviceId();
  const value = micDeviceId || mics[0]?.deviceId || null;

  return (
    <ResponsiveMenu open={open} onClose={onClose} anchorEl={anchorEl}>
      {mics.map((mic) => (
        <MenuItem
          value={mic.deviceId}
          key={mic.deviceId}
          selected={mic.deviceId === value}
          onClick={() => {
            media.setPreferredMicrophoneDeviceId(mic.deviceId);
            onClose();
          }}
        >
          {mic.label}
        </MenuItem>
      ))}
    </ResponsiveMenu>
  );
};
