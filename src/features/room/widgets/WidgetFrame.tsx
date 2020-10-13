import * as React from 'react';
import { Paper, makeStyles, ThemeProvider } from '@material-ui/core';
import clsx from 'clsx';
import * as themes from '../../../theme/theme';

export interface IWidgetFrameProps {
  children: React.ReactNode;
  className?: string;
  color?: 'mandarin' | 'cherry' | 'turquoise' | 'lavender';
}

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 200,
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: 10,
    overflow: 'hidden',
    cursor: 'default',
  },
}));

const stopMousePropagation = (ev: React.MouseEvent | React.PointerEvent) => {
  ev.stopPropagation();
};

/**
 * The external window frame of a floating widget. Defines the color
 * palette of the widget as well.
 */
export const WidgetFrame: React.FC<IWidgetFrameProps> = (props) => {
  const classes = useStyles();

  const theme = themes[props.color || 'lavender'];

  return (
    <ThemeProvider theme={theme}>
      <Paper
        {...props}
        className={clsx(classes.root, props.className)}
        onMouseDown={stopMousePropagation}
        onMouseMove={stopMousePropagation}
        onMouseUp={stopMousePropagation}
        onPointerDown={stopMousePropagation}
        onPointerMove={stopMousePropagation}
        onPointerUp={stopMousePropagation}
      />
    </ThemeProvider>
  );
};
