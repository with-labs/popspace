import * as React from 'react';
import { makeStyles, useTheme } from '@material-ui/core';
import { useResizeContext } from './ResizeContainer';
import { animated } from '@react-spring/web';
import { ResizeHandleIcon } from '../icons/ResizeHandleIcon';
import clsx from 'clsx';

export interface IResizeHandleProps {
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.grey[50],
    width: 16,
    height: 16,
    fontSize: '24px',
    cursor: 'se-resize',
    pointerEvents: 'initial',
    '&:hover': {
      color: theme.palette.grey[200],
    },
  },
}));

/**
 * Render this component within a ResizeContainer and it will act as a user
 * interaction point for manually controlling the size of the content
 */
export const ResizeHandle: React.FC<IResizeHandleProps> = ({ disabled, className, style, children }) => {
  const classes = useStyles();
  const { handleProps, isResizingSpringValue, disableResize } = useResizeContext();
  const theme = useTheme();

  if (disableResize || disabled) {
    return null;
  }

  return (
    <animated.div
      {...handleProps}
      style={{
        color: isResizingSpringValue.to((v) => (v ? theme.palette.grey[500] : undefined)) as any,
        ...(style as any),
      }}
      className={clsx(classes.root, className)}
    >
      {children || <ResizeHandleIcon fontSize="inherit" color="inherit" />}
    </animated.div>
  );
};
