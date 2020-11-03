import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import { ResizeHandle } from '../../../components/ResizeContainer/ResizeHandle';

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

  return <ResizeHandle className={classes.root} />;
};
