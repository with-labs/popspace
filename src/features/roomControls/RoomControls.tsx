import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import { RoomMenu } from './roomMenu/RoomMenu';
import { AwayScreen } from './away/AwayScreen';
import { AwayExplainer } from './away/AwayExplainer';
import { useIsAway } from './away/useIsAway';
import { RoomTaskbar } from './taskbar/RoomTaskbar';
import { ActionBar } from './addContent/ActionBar';

export interface IRoomControlsProps {}

const useStyles = makeStyles((theme) => ({
  taskbar: {},
  members: {
    position: 'fixed',
    right: theme.spacing(2),
    top: theme.spacing(2),
  },
}));

export const RoomControls = React.memo<IRoomControlsProps>(() => {
  const classes = useStyles();

  const [isAway] = useIsAway();

  return (
    <>
      {isAway && (
        <AwayScreen>
          <AwayExplainer />
        </AwayScreen>
      )}
      <RoomTaskbar className={classes.taskbar} />
      <RoomMenu className={classes.members} />
      <ActionBar />
    </>
  );
});
