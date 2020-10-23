import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, Grid, makeStyles, Typography, IconButton } from '@material-ui/core';
import LocalVideoPreview from '../../components/LocalVideoPreview/LocalVideoPreview';
import { CameraSelect } from './CameraSelect';
import { MicSelect } from './MicSelect';
import useLocalVideoToggle from '../../hooks/useLocalVideoToggle/useLocalVideoToggle';
import { PersonAvatar } from '../room/people/PersonAvatar';
import { useLocalParticipant } from '../../withHooks/useLocalParticipant/useLocalParticipant';
import { CloseIcon } from '../../withComponents/icons/CloseIcon';

export interface IAudioVideoSettingsModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const useStyles = makeStyles((theme) => ({
  videoPreviewContainer: {
    position: 'relative',
    '& > video': {
      position: 'absolute',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 6,
    },
  },
  videoPreviewSizer: {
    paddingTop: '100%',
    width: '100%',
  },
  avatar: {
    width: '60%',
    height: '60%',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

export const AudioVideoSettingsModal: React.FC<IAudioVideoSettingsModalProps> = (props) => {
  const classes = useStyles();
  const [isVideoEnabled] = useLocalVideoToggle();
  const localParticipant = useLocalParticipant();

  return (
    <Dialog open={props.isOpen} onClose={props.onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Audio &amp; Video</Typography>
        <IconButton className={classes.closeButton} onClick={props.onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item sm={12} md={6}>
            <div className={classes.videoPreviewContainer}>
              {isVideoEnabled ? (
                <LocalVideoPreview />
              ) : (
                <PersonAvatar personId={localParticipant?.sid} className={classes.avatar} />
              )}
              <div className={classes.videoPreviewSizer} />
            </div>
          </Grid>
          <Grid item sm={12} md={6}>
            <MicSelect margin="normal" label="Microphone" />
            <CameraSelect margin="normal" label="Camera" />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
