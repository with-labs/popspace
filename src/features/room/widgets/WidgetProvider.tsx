import * as React from 'react';
import { WidgetShapeForType, WidgetStateByType, WidgetType } from '@api/roomState/types/widgets';
import { useRoomStore } from '@api/useRoomStore';
import { logger } from '@utils/logger';
import { useDeleteWidget } from './useDeleteWidget';
import { useSaveWidget } from './useSaveWidget';

export type WidgetContextValue<T extends WidgetType> = {
  widget: WidgetShapeForType<T>;
  save: (state: Partial<WidgetStateByType[T]>) => void;
  remove: () => void;
};

export const WidgetContext = React.createContext<WidgetContextValue<any> | null>(null);

export interface IWidgetProviderProps {
  widgetId: string;
}

export const WidgetProvider: React.FC<IWidgetProviderProps> = ({ widgetId, ...props }) => {
  const widget = useRoomStore(React.useCallback((room) => room.widgets[widgetId], [widgetId]));
  const handleRemove = useDeleteWidget(widgetId, widget?.type);
  const handleSave = useSaveWidget(widgetId);

  const ctx = React.useMemo(
    () => ({
      widget,
      remove: handleRemove,
      save: handleSave,
    }),
    [widget, handleRemove, handleSave]
  );

  React.useEffect(() => {
    if (!widget?.widgetId || !widget?.widgetState) {
      logger.critical(
        `Widget sanity check failed`,
        `Widget ID:`,
        widget?.widgetId,
        `Widget state present:`,
        !!widget?.widgetState
      );
    }
  }, [widget?.widgetId, widget?.widgetState]);

  if (!widget) {
    // FIXME: why are widgets which arent in the store sometimes being rendered?
    return null;
  }

  // sanity check - widgetState should always exist, but
  // while this is theoretically guaranteed we have seen failures
  // crop up where it is not present.
  if (!widget.widgetId || !widget.widgetState) {
    return null;
  }

  return <WidgetContext.Provider value={ctx} {...props} />;
};
