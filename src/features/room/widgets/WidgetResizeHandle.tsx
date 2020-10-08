import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import { DraggableResizeHandle } from '../Draggable';

export interface IWidgetResizeHandleProps {}

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export const WidgetResizeHandle: React.FC<IWidgetResizeHandleProps> = (props) => {
  const classes = useStyles();

  return <DraggableResizeHandle className={classes.root} />;
};
