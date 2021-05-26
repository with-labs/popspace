import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import { RoomTaskbar } from './taskbar/RoomTaskbar';
import { ActionBar } from './addContent/ActionBar';
import { ViewportControls } from './viewport/ViewportControls';
import { Spacing } from '@components/Spacing/Spacing';
import { ExperimentsModal } from './experiments/ExperimentsModal';
import { WidgetMenu } from './widgetMenu/WidgetMenu';

export interface IRoomControlsProps {}

const useStyles = makeStyles((theme) => ({
  roomAndViewportControls: {
    position: 'fixed',
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    pointerEvents: 'none',
    '& > *': {
      pointerEvents: 'initial',
    },
  },
}));

export const RoomControls = React.memo<IRoomControlsProps>(() => {
  const classes = useStyles();

  return (
    <>
      <RoomTaskbar />
      {/* designs dont show these in them, but might want to revive these? everthing wip */}
      {/* <Spacing flexDirection="row" className={classes.roomAndViewportControls}>
        <ViewportControls />
      </Spacing> */}
      <ActionBar />
      <ExperimentsModal />
      <WidgetMenu />
    </>
  );
});
