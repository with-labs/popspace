import { MenuItem, TextField } from '@material-ui/core';
import * as React from 'react';
import { useAVSources } from '../../hooks/useAVSources/useAVSources';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';

export interface ICameraSelectProps {
  label?: string;
  helperText?: string;
  margin?: 'normal' | 'dense' | 'none';
}

export const CameraSelect: React.FC<ICameraSelectProps> = (props) => {
  const { cameras, initialized } = useAVSources();
  const { cameraDeviceId, setCameraDeviceId } = useLocalTracks();
  const value = cameraDeviceId || cameras[0]?.deviceId || null;

  // avoid rendering before the options are loaded
  if (!initialized) {
    return <TextField disabled />;
  }

  return (
    <TextField
      select
      {...props}
      value={value}
      onChange={(ev) => {
        setCameraDeviceId(ev.target.value);
      }}
    >
      {cameras.map((cam) => (
        <MenuItem value={cam.deviceId} key={cam.deviceId}>
          {cam.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
