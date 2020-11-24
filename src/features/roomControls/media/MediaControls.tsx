import { Box, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { CameraToggle } from './CameraToggle';
import { MicToggle } from './MicToggle';
import { ScreenShareToggle } from './ScreenShareToggle';

const useStyles = makeStyles((theme) => ({
  toggleButton: {
    marginLeft: theme.spacing(1),
    '&[selected] + &[selected]': {
      marginLeft: theme.spacing(1),
    },
  },
}));

export const MediaControls = () => {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="row" alignItems="center" color="grey.900">
      <CameraToggle className={classes.toggleButton} />
      <MicToggle className={classes.toggleButton} />
      <ScreenShareToggle className={classes.toggleButton} />
    </Box>
  );
};
