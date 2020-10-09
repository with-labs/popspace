import { useCallback } from 'react';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import { actions } from '../roomSlice';
import { WidgetData } from '../../../types/room';

/**
 * saves a widget, syncing its state to peers, and publishing it if
 * it is not already public
 */
export function useSaveWidget(widgetId: string) {
  const dispatch = useCoordinatedDispatch();

  return useCallback(
    (data: Partial<WidgetData>) => {
      dispatch(
        actions.updateWidgetData({
          id: widgetId,
          data,
          publish: true,
        })
      );
    },
    [widgetId, dispatch]
  );
}
