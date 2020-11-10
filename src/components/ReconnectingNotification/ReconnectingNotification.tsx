import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import InfoIcon from '@material-ui/icons/Info';
import Snackbar from '@material-ui/core/Snackbar';
import { SnackbarContent } from '@material-ui/core';

import useRoomState from '../../hooks/useRoomState/useRoomState';

const useStyles = makeStyles((theme) => ({
  snackbar: {
    backgroundColor: theme.palette.brandColors.oregano.light,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '0.8em',
  },
}));

export default function ReconnectingNotification() {
  const classes = useStyles();
  const roomState = useRoomState();

  return (
    <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={roomState === 'reconnecting'}>
      <SnackbarContent
        className={classes.snackbar}
        message={
          <span className={classes.message}>
            <InfoIcon className={classes.icon} />
            Reconnecting&hellip;
          </span>
        }
      />
    </Snackbar>
  );
}
