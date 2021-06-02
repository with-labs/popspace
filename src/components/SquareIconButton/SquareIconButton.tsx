import { IconButton, IconButtonProps, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

export interface SquareIconButtonProps extends IconButtonProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    borderRadius: 6,
    overflow: 'hidden',
    width: 48,
    height: 48,
    fontSize: 48,
    boxShadow: theme.focusRings.create('transparent', true),

    '&:focus': {
      boxShadow: theme.focusRings.create(theme.palette.brandColors.oregano.bold, true),
    },
  },
}));

export const SquareIconButton = React.forwardRef<HTMLButtonElement, SquareIconButtonProps>(
  ({ className, ...rest }, ref) => {
    const classes = useStyles();

    return <IconButton {...rest} ref={ref} className={clsx(classes.root, className)} />;
  }
);
