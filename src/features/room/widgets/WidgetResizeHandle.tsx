import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import { DraggableResizeHandle } from '../DraggableResizeHandle';

export interface IWidgetResizeHandleProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    right: theme.spacing(0.25),
    bottom: theme.spacing(0.25),
  },
}));

export const WidgetResizeHandle: React.FC<IWidgetResizeHandleProps> = (props) => {
  const classes = useStyles();

  return <DraggableResizeHandle className={classes.root} />;
};
