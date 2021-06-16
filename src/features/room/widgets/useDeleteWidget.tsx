import { useCallback } from 'react';
import client from '@api/client';

/** @deprecated call client.widgets.deleteWidget directly */
export function useDeleteWidget(widgetId: string) {
  return useCallback(() => {
    client.widgets.deleteWidget({ widgetId });
  }, [widgetId]);
}
