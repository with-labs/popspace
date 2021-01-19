import { useCallback } from 'react';
import { useRoomStore } from '../../../roomState/useRoomStore';

export function useDeleteWidget(widgetId: string) {
  const deleteWidget = useRoomStore((room) => room.api.deleteWidget);

  return useCallback(() => {
    deleteWidget({ widgetId });
  }, [deleteWidget, widgetId]);
}
