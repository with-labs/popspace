import * as React from 'react';
import { Bounds } from '../../../types/spatials';
import {
  IResizeContainerProps,
  ResizeContainer,
  ResizeContainerImperativeApi,
} from '../../../components/ResizeContainer/ResizeContainer';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { useWidgetContext } from './useWidgetContext';
import { useViewport } from '../../../providers/viewport/useViewport';

export interface IWidgetResizeContainerProps extends Omit<IResizeContainerProps, 'onResize' | 'size'> {
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

    const {
      widget: { widgetId },
    } = useWidgetContext();
    const viewport = useViewport();
    const getScaleFactor = React.useCallback(() => 1 / viewport.zoom, [viewport]);

    const size = useRoomStore(React.useCallback((room) => room.widgetPositions[widgetId]?.size ?? null, [widgetId]));
    const resizeWidget = useRoomStore((room) => room.api.resizeWidget);

    const onResize = React.useCallback(
      (newSize: Bounds) => {
        resizeWidget({
          widgetId,
          size: newSize,
        });
      },
      [resizeWidget, widgetId]
    );

    return (
      <ResizeContainer
        size={size}
        onResize={onResize}
        mode={mode}
        ref={ref}
        getResizeScaleFactor={getScaleFactor}
        {...restProps}
      >
        <div className={clsx(classes.content, className)}>{children}</div>
      </ResizeContainer>
    );
  }
);
