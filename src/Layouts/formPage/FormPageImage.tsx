/* eslint-disable jsx-a11y/alt-text */
import { Hidden, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

const useStyles = makeStyles({
  root: {
    maxWidth: '80vh',
    maxHeight: '100%',
    width: '100%',
    alignSelf: 'center',
    justifySelf: 'center',
  },
});

export function FormPageImage(props: React.HTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const classes = useStyles();
  return (
    <Hidden mdDown>
      <img {...props} className={clsx(classes.root, props.className)} />
    </Hidden>
  );
}
