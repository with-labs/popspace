import { makeStyles } from '@material-ui/core';
import * as React from 'react';

interface IBannerProps {
  children?: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.mandarin.light,
    color: theme.palette.brandColors.mandarin.ink,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.5),
    width: '100%',
  },
}));

export const Banner: React.FC<IBannerProps> = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.root}>{children}</div>;
};
