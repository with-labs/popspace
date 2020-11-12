import { MenuItem, TextField } from '@material-ui/core';
import * as React from 'react';
import { useAVSources } from '../../hooks/useAVSources/useAVSources';
import { useLocalTracks } from '../../components/LocalTracksProvider/useLocalTracks';

export interface IMicSelectProps {
  label?: string;
  helperText?: string;
  margin?: 'normal' | 'dense' | 'none';
}

export const MicSelect: React.FC<IMicSelectProps> = (props) => {
  const { mics, initialized } = useAVSources();
  const { micDeviceId, setMicDeviceId } = useLocalTracks();

  // avoid rendering before the options are loaded
  if (!initialized) {
    return <TextField disabled />;
  }

  return (
    <TextField
      select
      {...props}
      value={micDeviceId ?? null}
      onChange={(ev) => {
        setMicDeviceId(ev.target.value);
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
