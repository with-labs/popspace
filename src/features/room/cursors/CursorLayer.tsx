import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import shallow from 'zustand/shallow';
import { useRoomStore } from '@api/useRoomStore';
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
  // used below to not render your own cursor
  const ownUserId = useRoomStore((room) => room.sessionId && room.sessionLookup[room.sessionId]);

  return (
    <div className={classes.root}>
      {cursorUserIds.map((userId) => (userId === ownUserId ? null : <Cursor userId={userId} key={userId} />))}
    </div>
  );
}
