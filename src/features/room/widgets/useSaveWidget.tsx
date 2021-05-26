import { useRoomStore } from '@roomState/useRoomStore';
import { useCallback } from 'react';
import { WidgetState } from '@roomState/types/widgets';

/**
 * saves a widget, syncing its state to peers, and publishing it if
 * it is not already public
 */
export const useSaveWidget = (widgetId: string) => {
  const update = useRoomStore((room) => room.api.updateWidget);
  return useCallback(
    (data: Partial<WidgetState>) => {
      update({
        widgetId,
        widgetState: data,
      });
    },
    [update, widgetId]
  );
};
