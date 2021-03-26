import * as React from 'react';
import { Theme, makeStyles, ButtonBase, IconButton } from '@material-ui/core';
import { EraserIcon } from '../icons/EraserIcon';
import clsx from 'clsx';

import palette from '../../theme/palette';
export const ERASER_COLOR = palette.slate.regular;

export interface IColorButtonProps {
  color: string;
  active: boolean;
  onClick: (ev: any) => void;
}

const useStyles = makeStyles<Theme, IColorButtonProps>((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.primary,
    boxShadow: theme.focusRings.idle,
    borderRadius: '100%',
    '&:hover:not($active)': {
      boxShadow: theme.focusRings.create(theme.palette.grey[50]),
    },
    '&:active, &:focus:not($active)': {
      boxShadow: theme.focusRings.create(theme.palette.grey[500]),
    },
  },
  active: {
    boxShadow: theme.focusRings.create(theme.palette.grey[900]),
  },
  eraser: {
    padding: 2,
  },
  color: {
    padding: 6,
  },
  dot: ({ color }) => ({
    width: 12,
    height: 12,
    borderRadius: '100%',
    backgroundColor: color,
  }),
}));

export const ColorButton = React.forwardRef<HTMLButtonElement, IColorButtonProps>((props, ref) => {
  const classes = useStyles(props);

  if (props.color === ERASER_COLOR) {
    return (
      <IconButton
        size="small"
        onClick={props.onClick}
        className={clsx(classes.root, classes.eraser, props.active && classes.active)}
        ref={ref}
      >
        <EraserIcon fontSize="small" color="inherit" />
      </IconButton>
    );
  }

  return (
    <ButtonBase
      onClick={props.onClick}
      className={clsx(classes.root, classes.color, props.active && classes.active)}
      ref={ref}
    >
      <div className={classes.dot} />
    </ButtonBase>
  );
});
