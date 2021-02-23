import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(4),
    overflow: 'auto',
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(1),
      overflow: 'hidden',
    },
  },
}));

export function FormPageContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const classes = useStyles();

  return <section {...props} className={clsx(classes.root, props.className)} />;
}
