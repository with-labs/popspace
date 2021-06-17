import * as React from 'react';
import { makeStyles, ThemeProvider } from '@material-ui/core';
import clsx from 'clsx';
import * as themes from '../../../theme/theme';
import { useRoomStore } from '@api/useRoomStore';
import { useWidgetContext } from './useWidgetContext';
import { ThemeName } from '../../../theme/theme';
import { CanvasObject, ICanvasObjectProps } from '@providers/canvas/CanvasObject';
import { WidgetResizeHandle } from './WidgetResizeHandle';
import client from '@api/client';

export interface IWidgetFrameProps extends Omit<ICanvasObjectProps, 'objectId' | 'objectKind'> {
  children: React.ReactNode;
  className?: string;
  color?: ThemeName | 'transparent';
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
    position: 'relative',
  },
  rootTransparent: {
    background: 'transparent',
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
  const bringToFront = React.useCallback(() => {
    client.roomState.bringToFront({ widgetId });
  }, [widgetId]);

  const theme = color === 'transparent' ? themes.snow : themes[color || 'lavender'];

  return (
    <ThemeProvider theme={theme}>
      <CanvasObject
        objectId={widgetId}
        zIndex={zIndex}
        onDragStart={bringToFront}
        objectKind="widget"
        className={clsx(classes.root, color === 'transparent' && classes.rootTransparent, className)}
        {...rest}
      >
        {children}
        {!rest.resizeDisabled && <WidgetResizeHandle />}
      </CanvasObject>
    </ThemeProvider>
  );
};
