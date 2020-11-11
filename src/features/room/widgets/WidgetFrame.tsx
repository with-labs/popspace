import * as React from 'react';
import { Paper, makeStyles, ThemeProvider } from '@material-ui/core';
import clsx from 'clsx';
import * as themes from '../../../theme/theme';
import { Draggable } from '../Draggable';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../state/store';
import { useSelector } from 'react-redux';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import { actions } from '../roomSlice';

export interface IWidgetFrameProps {
  children: React.ReactNode;
  className?: string;
  color?: 'mandarin' | 'cherry' | 'oregano' | 'lavender' | 'snow' | 'slate';
  widgetId: string;
}

function useZIndex(widgetId: string) {
  const selectZIndex = React.useMemo(
    () =>
      createSelector(
        (state: RootState) => state.room.zOrder || [],
        (_: any, id: string) => id,
        (zOrder, id) => {
          const index = zOrder.indexOf(id);
          if (index !== -1) return index;
          return 0;
        }
      ),
    []
  );
  const zIndex = useSelector((state: RootState) => selectZIndex(state, widgetId));
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
  const dispatch = useCoordinatedDispatch();
  const bringToFront = React.useCallback(() => {
    dispatch(actions.bringToFront({ id: widgetId }));
  }, [dispatch, widgetId]);

  const theme = themes[props.color || 'lavender'];

  return (
    <Draggable id={widgetId} zIndex={zIndex} onDragStart={bringToFront}>
      <ThemeProvider theme={theme}>
        <Paper {...props} elevation={1} className={clsx(classes.root, props.className)} />
      </ThemeProvider>
    </Draggable>
  );
};
