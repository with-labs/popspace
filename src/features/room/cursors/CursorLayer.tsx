import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import shallow from 'zustand/shallow';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { Cursor } from './Cursor';

const useStyles = makeStyles((theme) => ({
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    zIndex: theme.zIndex.tooltip,
  },
}));

export function CursorLayer() {
  const classes = useStyles();
  const cursorUserIds = useRoomStore((room) => Object.keys(room.cursors), shallow);

  return (
    <div className={classes.root}>
      {cursorUserIds.map((userId) => (
        <Cursor userId={userId} key={userId} />
      ))}
    </div>
  );
}
