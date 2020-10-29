import * as React from 'react';
import { makeStyles, IconButton, IconButtonProps } from '@material-ui/core';
import clsx from 'clsx';

export interface IWidgetTitlebarButtonProps extends IconButtonProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 4,
    boxShadow: theme.focusRings.idle,
    transition: theme.transitions.create(['background-color', 'color', 'box-shadow']),
    '& + &': {
      marginLeft: theme.spacing(0.5),
    },
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '&:focus': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.focusRings.create(theme.palette.primary.dark),
    },
    '& svg': {
      width: 24,
      height: 24,
    },
  },
}));

export const WidgetTitlebarButton: React.FC<IWidgetTitlebarButtonProps> = ({ className, children, ...rest }) => {
  const classes = useStyles();

  return (
    <IconButton size="small" color="inherit" className={clsx(classes.root, className)} {...rest}>
      {children}
    </IconButton>
  );
};
