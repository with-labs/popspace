import { Box, makeStyles, Hidden } from '@material-ui/core';
import * as React from 'react';
import { CameraToggle } from './CameraToggle';
import { MicToggle } from './MicToggle';
import { ScreenShareToggle } from './ScreenShareToggle';

const useStyles = makeStyles((theme) => ({
  toggleButton: {
    marginLeft: 0,
  },
}));

export const MediaControls = () => {
  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="row" alignItems="center" color="grey.900" pl={1}>
      <CameraToggle className={classes.toggleButton} />
      <MicToggle className={classes.toggleButton} />
      <Hidden smDown>
        <ScreenShareToggle className={classes.toggleButton} />
      </Hidden>
    </Box>
  );
};
