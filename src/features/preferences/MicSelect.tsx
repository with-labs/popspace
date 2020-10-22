import { MenuItem, TextField } from '@material-ui/core';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAVSources } from '../../withHooks/useAVSources/useAVSources';
import * as preferences from './preferencesSlice';

export interface IMicSelectProps {
  label?: string;
  helperText?: string;
}

export const MicSelect: React.FC<IMicSelectProps> = ({ label, helperText }) => {
  const { mics } = useAVSources();

  const activeMicId = useSelector(preferences.selectors.selectActiveMicId) || mics[0]?.deviceId || '';

  const dispatch = useDispatch();

  return (
    <TextField
      select
      label={label}
      helperText={helperText}
      value={activeMicId}
      onChange={(ev) => {
        dispatch(preferences.actions.setActiveMic({ deviceId: ev.target.value }));
      }}
    >
      {mics.map((mic) => (
        <MenuItem value={mic.deviceId} key={mic.deviceId}>
          {mic.label}
        </MenuItem>
      ))}
    </TextField>
  );
};
