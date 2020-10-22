import * as React from 'react';
import { Theme, makeStyles, ButtonBase } from '@material-ui/core';
import { ERASER_COLOR } from './constants';
import { ReactComponent as Eraser } from './images/eraser.svg';

export interface IColorButtonProps {
  color: string;
  active: boolean;
  onClick: () => void;
}

const useStyles = makeStyles<Theme, IColorButtonProps>((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1),
    color: theme.palette.grey[900],
  },
  dot: ({ color }) => ({
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: color,
  }),
  indicator: ({ color, active }) => ({
    visibility: active ? 'visible' : 'hidden',
    borderBottom: `4px solid ${color}`,
    width: '100%',
    height: 1,
    marginTop: theme.spacing(1),
  }),
}));

export const ColorButton = React.forwardRef<HTMLButtonElement, IColorButtonProps>((props, ref) => {
  const classes = useStyles(props);

  return (
    <ButtonBase onClick={props.onClick} className={classes.root} ref={ref}>
      {props.color === ERASER_COLOR ? <Eraser /> : <div className={classes.dot} />}
      <div className={classes.indicator} />
    </ButtonBase>
  );
});
