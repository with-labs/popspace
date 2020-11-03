import * as React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../state/store';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import { actions } from '../roomSlice';
import { Bounds } from '../../../types/spatials';
import { ResizeContainer, ResizeMode } from '../../../components/ResizeContainer/ResizeContainer';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export interface IWidgetResizeContainerProps {
  widgetId: string;
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  mode?: ResizeMode;
  className?: string;
}

// since widgets are center-anchored, dragging the corner
// has double the scale effect since the object scales in
// both directions.
const resizeScaleFactor = 2;

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
  widgetId,
  mode,
  children,
  className,
  ...boundsProps
}) => {
  const classes = useStyles();

  // creating a memoized selector for perf benefits
  const sizeSelector = React.useMemo(
    () =>
      createSelector(
        (state: RootState) => state.room.positions,
        (_: any, objectId: string) => objectId,
        (positions, objectId) => positions[objectId]?.size ?? null
      ),
    []
  );

  const size = useSelector((state: RootState) => sizeSelector(state, widgetId));

  const coordinatedDispatch = useCoordinatedDispatch();
  const onResize = React.useCallback(
    (newSize: Bounds) => {
      coordinatedDispatch(
        actions.resizeObject({
          id: widgetId,
          size: newSize,
        })
      );
    },
    [coordinatedDispatch, widgetId]
  );

  return (
    <ResizeContainer size={size} onResize={onResize} mode={mode} resizeScaleFactor={resizeScaleFactor} {...boundsProps}>
      <div className={clsx(classes.content, className)}>{children}</div>
    </ResizeContainer>
  );
};
