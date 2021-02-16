import { Box, makeStyles } from '@material-ui/core';
import { useFeatureFlag } from 'flagg';
import * as React from 'react';
import { isPIPAvailable } from '../../pictureInPicture/pictureInPictureFeatureDetection';
import { CameraToggle } from './CameraToggle';
import { MicToggle } from './MicToggle';
import { PictureInPictureToggle } from './PictureInPictureToggle';
import { ScreenShareToggle } from './ScreenShareToggle';
import { StatusControls } from './StatusControls';

const useStyles = makeStyles((theme) => ({
  toggleButton: {
    marginLeft: 0,
  },
  soloButton: {
    marginLeft: theme.spacing(1),
  },
}));

export const MediaControls: React.FC<{ className?: string }> = ({ className }) => {
  const classes = useStyles();

  const [hasPip] = useFeatureFlag('pictureInPicture');

  return (
    <Box display="flex" flexDirection="row" alignItems="center" color="grey.900" className={className}>
      <CameraToggle className={classes.toggleButton} />
      <MicToggle className={classes.toggleButton} />
      <StatusControls className={classes.toggleButton} />
      <ScreenShareToggle className={classes.toggleButton} />
      {isPIPAvailable && hasPip && <PictureInPictureToggle className={classes.soloButton} />}
    </Box>
  );
};
