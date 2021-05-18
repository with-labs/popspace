import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(7.5),
    paddingBottom: theme.spacing(7.5),
    paddingLeft: theme.spacing(7.5),
    overflow: 'auto',
    gridArea: 'content',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(3),
      overflow: 'visible',
      maxWidth: 680,
      width: '100%',
      justifySelf: 'center',
      paddingBottom: '100px',
    },
  },
}));

export function FormPageContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const classes = useStyles();

  return <section {...props} className={clsx(classes.root, props.className)} />;
}
