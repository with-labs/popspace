import * as React from 'react';
import {
  IResizeContainerProps,
  ResizeContainer,
  ResizeContainerImperativeApi,
} from '../../../providers/canvas/ResizeContainer';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export interface IWidgetResizeContainerProps
  extends Omit<IResizeContainerProps, 'onResizeEnd' | 'onResizeStart' | 'onResize' | 'size'> {
  className?: string;
}

const useStyles = makeStyles({
  content: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
});

/**
 * Creates a resizeable content container for widget content. A wrapper around
 * ResizeContainer which connects to the Room state to store and update sizing.
 */
export const WidgetResizeContainer = React.forwardRef<ResizeContainerImperativeApi, IWidgetResizeContainerProps>(
  ({ mode, children, className, ...restProps }, ref) => {
    const classes = useStyles();

    return (
      <ResizeContainer mode={mode} ref={ref} {...restProps}>
        <div className={clsx(classes.content, className)}>{children}</div>
      </ResizeContainer>
    );
  }
);
