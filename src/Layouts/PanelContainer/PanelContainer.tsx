import React from 'react';
import { makeStyles } from '@material-ui/core';

interface IPanelContainerProps {
  children: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: 340,
    },
  },
}));

/**
 * PannelContainer is a special kind of layout component that will lock the content to a max of 340px on
 * md widths and above. Most commonly used with the two column layout
 * @param children
 */
export const PanelContainer: React.FC<IPanelContainerProps> = ({ children }) => {
  const classes = useStyles();

  return <div className={classes.container}>{children}</div>;
};
