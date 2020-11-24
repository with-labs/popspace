import * as React from 'react';
import { Box, makeStyles, Paper } from '@material-ui/core';
import { Omnibar } from './omnibar/Omnibar';
import { MediaControls } from './media/MediaControls';
import { RoomMenu } from './roomMenu/RoomMenu';
import { MembersMenu } from './membership/MembersMenu';
import { useIsRoomOwner } from '../../hooks/useIsRoomOwner/useIsRoomOwner';

export interface IRoomControlsProps {}

const useStyles = makeStyles((theme) => ({
  mainControls: {
    position: 'fixed',
    left: theme.spacing(2),
    top: theme.spacing(2),
    zIndex: theme.zIndex.speedDial,
    borderRadius: 16,
    padding: theme.spacing(1.5),
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
}));

export const RoomControls = React.memo<IRoomControlsProps>((props) => {
  const classes = useStyles();

  const isRoomOwner = useIsRoomOwner();

  return (
    <>
      <Box component={Paper} className={classes.mainControls} display="flex" flexDirection="row" alignItems="center">
        <RoomMenu />
        <Omnibar />
        <MediaControls />
      </Box>
      {/* TODO: when we have a prettier list of members, we will show
      it here even if you aren't the owner */}
      {isRoomOwner && (
        <Box component={Paper} className={classes.membersMenu}>
          <MembersMenu />
        </Box>
      )}
    </>
  );
});
