import * as React from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core';
import clsx from 'clsx';
import * as themes from '../../../theme/theme';
import { Draggable } from '../Draggable';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { useWidgetContext } from './useWidgetContext';

export interface IWidgetFrameProps {
  children: React.ReactNode;
  className?: string;
  color?: 'mandarin' | 'cherry' | 'oregano' | 'lavender' | 'snow' | 'slate';
}

function useZIndex(widgetId: string) {
  const zIndex = useRoomStore(
    React.useCallback(
      (room) => {
        const index = (room.state.zOrder ?? []).indexOf(widgetId);
        if (index !== -1) return index;
        return 0;
      },
      [widgetId]
    )
  );
  return zIndex;
}

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.mainShadows.surface,
    overflow: 'hidden',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
  },
}));

/**
 * The external window frame of a floating widget. Defines the color
 * palette of the widget as well.
 */
export const WidgetFrame: React.FC<IWidgetFrameProps> = ({ className, children, color, ...rest }) => {
  const classes = useStyles();

  const {
    widget: { widgetId },
  } = useWidgetContext();

  const zIndex = useZIndex(widgetId);
  const bringToFrontAction = useRoomStore((room) => room.api.bringToFront);
  const bringToFront = React.useCallback(() => {
    bringToFrontAction({ widgetId });
  }, [bringToFrontAction, widgetId]);

  const theme = themes[color || 'lavender'];

  return (
    <ThemeProvider theme={theme}>
      <Draggable
        id={widgetId}
        zIndex={zIndex}
        onDragStart={bringToFront}
        kind="widget"
        className={clsx(classes.root, className)}
      >
        {children}
      </Draggable>
    </ThemeProvider>
  );
};
