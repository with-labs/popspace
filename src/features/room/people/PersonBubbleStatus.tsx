import { makeStyles } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';

export interface IPersonBubbleStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  isVideoOn: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    zIndex: 1,
    borderRadius: 14,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
}));

export const PersonBubbleStatus = React.forwardRef<HTMLDivElement, IPersonBubbleStatusProps>(
  ({ isVideoOn, className, ...rest }, ref) => {
    const classes = useStyles();

    const statusStyles = useSpring({
      left: isVideoOn ? 8 : 16,
      top: isVideoOn ? 8 : 0,
      x: isVideoOn ? '0%' : '-100%',
    });

    return <animated.div ref={ref} className={clsx(classes.root, className)} style={statusStyles as any} {...rest} />;
  }
);
