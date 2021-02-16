import { makeStyles } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';

export interface IPersonBubbleLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  isVideoOn: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const PersonBubbleLabel = React.forwardRef<HTMLDivElement, IPersonBubbleLabelProps>(
  ({ isVideoOn, className, ...rest }, ref) => {
    const classes = useStyles();

    const bottomSectionStyles = useSpring({
      lineHeight: '1',
      height: isVideoOn ? 24 : 16,
    });

    return (
      <animated.div ref={ref} className={clsx(classes.root, className)} style={bottomSectionStyles as any} {...rest} />
    );
  }
);
