import React from 'react';
import { makeStyles } from '@material-ui/core';

interface ITwoColLayoutProps {
  children: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: theme.spacing(4),
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
}));

export const TwoColLayout: React.FC<ITwoColLayoutProps> = ({ children }) => {
  const classes = useStyles();

  return <div className={classes.root}>{children}</div>;
};
