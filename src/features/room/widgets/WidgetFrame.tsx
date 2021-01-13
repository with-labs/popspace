import * as React from 'react';
import { Paper, makeStyles, ThemeProvider } from '@material-ui/core';
import clsx from 'clsx';
import * as themes from '../../../theme/theme';
import { Draggable } from '../Draggable';
import { useRoomStore } from '../../../roomState/useRoomStore';

export interface IWidgetFrameProps {
  children: React.ReactNode;
  className?: string;
  color?: 'mandarin' | 'cherry' | 'oregano' | 'lavender' | 'snow' | 'slate';
  widgetId: string;
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
    width: '100%',
    height: '100%',
    background: theme.palette.background.paper,
    overflow: 'hidden',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
  },
}));

/**
 * The external window frame of a floating widget. Defines the color
 * palette of the widget as well.
 */
export const WidgetFrame: React.FC<IWidgetFrameProps> = ({ widgetId, ...props }) => {
  const classes = useStyles();
  const zIndex = useZIndex(widgetId);
  const bringToFrontAction = useRoomStore((room) => room.api.bringToFront);
  const bringToFront = React.useCallback(() => {
    bringToFrontAction({ widgetId });
  }, [bringToFrontAction, widgetId]);

  const theme = themes[props.color || 'lavender'];

  return (
    <Draggable id={widgetId} zIndex={zIndex} onDragStart={bringToFront} kind="widget">
      <ThemeProvider theme={theme}>
        <Paper {...props} elevation={1} className={clsx(classes.root, props.className)} />
      </ThemeProvider>
    </Draggable>
  );
};
