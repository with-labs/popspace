import * as React from 'react';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import { actions } from '../roomSlice';

/**
 * Use this hook to get a function you can call to manually trigger
 * a remeasure of a widget
 */
export function useRemeasureWidget(id: string) {
  const dispatch = useCoordinatedDispatch();
  return React.useCallback(() => {
    dispatch(actions.resizeObject({ id, size: null }));
  }, [id, dispatch]);
}
