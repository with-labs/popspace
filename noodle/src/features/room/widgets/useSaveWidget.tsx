import { useCallback } from 'react';
import { WidgetState } from '@api/roomState/types/widgets';
import client from '@api/client';

/**
 * @deprecated call client.widgets.updateWidget directly
 */
export const useSaveWidget = (widgetId: string) => {
  return useCallback(
    (data: Partial<WidgetState>) => {
      client.widgets.updateWidget({
        widgetId,
        widgetState: data,
      });
    },
    [widgetId]
  );
};
