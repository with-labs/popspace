import React from 'react';
import clsx from 'clsx';
import { makeStyles, Box } from '@material-ui/core';

// TODO: expand this to be able to hide columns
// at different breakpoints
interface IColumnProps {
  children: React.ReactNode;
  classNames?: string;
  useColMargin?: boolean;
  centerContent?: boolean;
  hide?: 'sm' | 'md' | 'lg';
}

const useStyles = makeStyles((theme) => ({
  column: {
    maxWidth: 600,
    minWidth: 280,
    width: '100%',
    justifyContent: 'flex-start',
    [theme.breakpoints.up('md')]: {
      flexBasis: 'auto',
      width: '50%',
    },
  },
  colMargin: {
    marginRight: 0,
    [theme.breakpoints.up('md')]: {
      marginRight: theme.spacing(3),
    },
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hideSm: {
    [theme.breakpoints.only('sm')]: {
      display: 'none',
    },
  },
  hideMd: {
    [theme.breakpoints.only('md')]: {
      display: 'none',
    },
  },
  hideLg: {
    [theme.breakpoints.only('lg')]: {
      display: 'none',
    },
  },
}));

export const Column: React.FC<IColumnProps> = (props) => {
  const { classNames, children, useColMargin = false, centerContent = false, hide } = props;
  const classes = useStyles();

  return (
    <Box
      display="flex"
      className={clsx(
        classes.column,
        {
          [classes.colMargin]: useColMargin,
          [classes.centerContent]: centerContent,
          [classes.hideSm]: hide === 'sm',
          [classes.hideMd]: hide === 'md',
          [classes.hideLg]: hide === 'lg',
        },
        classNames
      )}
    >
      {children}
    </Box>
  );
};
