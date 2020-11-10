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
  const { cameras } = useAVSources();
  const { cameraDeviceId, setCameraDeviceId } = useLocalTracks();

  return (
    <TextField
      select
      {...props}
      value={cameraDeviceId}
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
