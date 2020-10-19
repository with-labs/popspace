import * as React from 'react';
import { Paper, makeStyles, ThemeProvider } from '@material-ui/core';
import clsx from 'clsx';
import * as themes from '../../../theme/theme';
import { Draggable } from '../Draggable';
import { WidgetResizeHandle } from './WidgetResizeHandle';

export interface IWidgetFrameProps {
  children: React.ReactNode;
  className?: string;
  color?: 'mandarin' | 'cherry' | 'turquoise' | 'lavender';
  isResizable?: boolean;
  widgetId: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: 10,
    overflow: 'hidden',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
  },
}));

const stopMousePropagation = (ev: React.MouseEvent | React.PointerEvent) => {
  ev.stopPropagation();
};

/**
 * The external window frame of a floating widget. Defines the color
 * palette of the widget as well.
 */
export const WidgetFrame: React.FC<IWidgetFrameProps> = ({
  isResizable,
  widgetId,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  ...props
}) => {
  const classes = useStyles();

  const theme = themes[props.color || 'lavender'];

  return (
    <Draggable
      id={widgetId}
      isResizable={isResizable}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
    >
      <ThemeProvider theme={theme}>
        <Paper
          {...props}
          style={{
            minWidth,
            minHeight,
            maxWidth,
            maxHeight,
          }}
          className={clsx(classes.root, props.className)}
          onMouseDown={stopMousePropagation}
          onMouseMove={stopMousePropagation}
          onMouseUp={stopMousePropagation}
          onPointerDown={stopMousePropagation}
          onPointerMove={stopMousePropagation}
          onPointerUp={stopMousePropagation}
        />
        {isResizable && <WidgetResizeHandle />}
      </ThemeProvider>
    </Draggable>
  );
};
