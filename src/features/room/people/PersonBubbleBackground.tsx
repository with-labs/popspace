import { makeStyles, useTheme } from '@material-ui/core';
import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';
import { EXPANDED_SIZE, SMALL_SIZE } from './constants';

export interface IPersonBubbleBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  isVideoOn: boolean;
  backgroundColor: string;
  grayscale?: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    flex: 1,
  },
}));

export const PersonBubbleBackground = React.forwardRef<HTMLDivElement, IPersonBubbleBackgroundProps>(
  ({ isVideoOn, backgroundColor, className, grayscale, ...rest }, ref) => {
    const classes = useStyles();
    const theme = useTheme();
    const graphicStyles = useSpring({
      backgroundColor: grayscale ? theme.palette.grey[500] : backgroundColor,
    });

    return <animated.div ref={ref} className={clsx(classes.root, className)} style={graphicStyles as any} {...rest} />;
  }
);
