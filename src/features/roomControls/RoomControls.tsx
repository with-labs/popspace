import * as React from 'react';
import { Box, makeStyles, Paper } from '@material-ui/core';
import { RoomAddContent } from './addContent/RoomAddContent';
import { MediaControls } from './media/MediaControls';
import { RoomMenu } from './roomMenu/RoomMenu';
import { MembersMenu } from './membership/MembersMenu';
import { BugReport } from './BugReport/BugReport';
import { SendFeedback } from './SendFeedback/SendFeedback';
import clsx from 'clsx';

export interface IRoomControlsProps {}

const useStyles = makeStyles((theme) => ({
  controlsWrapper: {
    position: 'fixed',
    left: theme.spacing(2),
    top: theme.spacing(2),
    pointerEvents: 'none',
  },
  mainControls: {
    zIndex: theme.zIndex.speedDial,
    borderRadius: 16,
    padding: theme.spacing(1.5),
    pointerEvents: 'auto',
  },
  settingsButton: {
    marginLeft: theme.spacing(1),
  },
  membersMenu: {
    position: 'fixed',
    right: theme.spacing(2),
    top: theme.spacing(2),
    borderRadius: 16,
    padding: theme.spacing(1.5),
  },
  reportButton: {
    marginTop: theme.spacing(2),
    pointerEvents: 'auto',
    [theme.breakpoints.down('sm')]: {
      width: 64,
    },
  },
  buttonPadding: {
    marginRight: theme.spacing(2),
  },
}));

export const RoomControls = React.memo<IRoomControlsProps>((props) => {
  const classes = useStyles();

  return (
    <>
      <Box className={classes.controlsWrapper} display="flex" flexDirection="column">
        <Box component={Paper} className={classes.mainControls} display="flex" flexDirection="row" alignItems="center">
          <RoomMenu />
          <RoomAddContent />
          <MediaControls />
        </Box>
        <Box display="flex" flexDirection="row">
          <BugReport className={clsx(classes.reportButton, classes.buttonPadding)} />
          <SendFeedback className={classes.reportButton} />
        </Box>
      </Box>
      {
        <Box component={Paper} className={classes.membersMenu}>
          <MembersMenu />
        </Box>
      }
    </>
  );
});
