import * as React from 'react';
import { Bounds } from '../../../types/spatials';
import { ResizeContainer, ResizeMode } from '../../../components/ResizeContainer/ResizeContainer';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { useWidgetContext } from './useWidgetContext';

export interface IWidgetResizeContainerProps {
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  mode?: ResizeMode;
  className?: string;
  disableInitialSizing?: boolean;
  disabled?: boolean;
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
export const WidgetResizeContainer: React.FC<IWidgetResizeContainerProps> = ({
  mode,
  children,
  className,
  ...restProps
}) => {
  const classes = useStyles();

  const {
    widget: { widgetId },
  } = useWidgetContext();

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
    <ResizeContainer size={size} onResize={onResize} mode={mode} {...restProps}>
      <div className={clsx(classes.content, className)}>{children}</div>
    </ResizeContainer>
  );
};
