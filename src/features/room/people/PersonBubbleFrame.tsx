import { makeStyles } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';
import { EXPANDED_SIZE, SMALL_SIZE } from './constants';

export interface IPersonBubbleFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  isVideoOn: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: `4px solid ${theme.palette.background.paper}`,
    transition: theme.transitions.create('border-color'),
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.mainShadows.surface,
  },
}));

export const PersonBubbleFrame = React.forwardRef<HTMLDivElement, IPersonBubbleFrameProps>(
  ({ isVideoOn, ...rest }, ref) => {
    const classes = useStyles();

    const rootStyles = useSpring({
      borderRadius: isVideoOn ? 32 : '100%',
      width: isVideoOn ? EXPANDED_SIZE : SMALL_SIZE,
      height: isVideoOn ? EXPANDED_SIZE : SMALL_SIZE,
    });

    return (
      <animated.div
        {...rest}
        ref={ref}
        className={clsx(classes.root, rest.className)}
        style={rootStyles as any}
      ></animated.div>
    );
  }
);
