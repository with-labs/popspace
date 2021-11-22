import { makeStyles } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';

import { SMALL_SIZE } from './constants';

export interface IPersonBubbleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  isVideoOn: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const PersonBubbleContent = React.forwardRef<HTMLDivElement, IPersonBubbleContentProps>(
  ({ isVideoOn, className, ...rest }, ref) => {
    const classes = useStyles();
    const mainContentStyles = useSpring({
      // reduce border radius to align based on border width
      borderRadius: isVideoOn ? 28 : SMALL_SIZE,
    });

    return <animated.div className={clsx(classes.root, className)} style={mainContentStyles as any} {...rest} />;
  }
);
