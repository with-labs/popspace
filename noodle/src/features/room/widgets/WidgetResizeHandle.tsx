import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import { ResizeHandle } from '@providers/canvas/ResizeHandle';
import clsx from 'clsx';

export interface IWidgetResizeHandleProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    right: theme.spacing(0.25),
    bottom: theme.spacing(0.25),
  },
}));

export const WidgetResizeHandle: React.FC<IWidgetResizeHandleProps> = (props) => {
  const classes = useStyles();

  return <ResizeHandle className={clsx(classes.root, props.className)} />;
};
