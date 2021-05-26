import * as React from 'react';
import { makeStyles, useTheme } from '@material-ui/core';
import { animated } from '@react-spring/web';
import { ResizeHandleIcon } from '@components/icons/ResizeHandleIcon';
import clsx from 'clsx';
import { useCanvasObject } from './CanvasObject';

export interface IResizeHandleProps {
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.grey[300],
    width: 16,
    height: 16,
    fontSize: '24px',
    cursor: 'se-resize',
    pointerEvents: 'initial',
    '&:hover': {
      color: theme.palette.grey[700],
    },
  },
}));

/**
 * Render this component within a ResizeContainer and it will act as a user
 * interaction point for manually controlling the size of the content
 */
export const ResizeHandle: React.FC<IResizeHandleProps> = ({ disabled, className, style, children }) => {
  const classes = useStyles();
  const { resizeHandleProps, isResizingAnimatedValue, resizeDisabled } = useCanvasObject();
  const theme = useTheme();

  if (resizeDisabled || disabled) {
    return null;
  }

  return (
    <animated.div
      {...resizeHandleProps}
      style={{
        color: isResizingAnimatedValue.to((v) => (v ? theme.palette.grey[500] : undefined)) as any,
        ...(style as any),
      }}
      className={clsx(classes.root, className)}
    >
      {children || <ResizeHandleIcon fontSize="inherit" color="inherit" />}
    </animated.div>
  );
};
