import { MenuItem, TextField } from '@material-ui/core';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAVSources } from '../../withHooks/useAVSources/useAVSources';
import * as preferences from './preferencesSlice';

export interface ICameraSelectProps {
  label?: string;
  helperText?: string;
}

export const CameraSelect: React.FC<ICameraSelectProps> = ({ label, helperText }) => {
  const { cameras } = useAVSources();

  const activeCameraId = useSelector(preferences.selectors.selectActiveCameraId) || cameras[0]?.deviceId || '';

  const dispatch = useDispatch();

  return (
    <TextField
      select
      label={label}
      helperText={helperText}
      value={activeCameraId}
      onChange={(ev) => {
        dispatch(preferences.actions.setActiveCamera({ deviceId: ev.target.value }));
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
