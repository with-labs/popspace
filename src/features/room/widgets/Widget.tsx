import * as React from 'react';
import { LinkWidget } from './link/LinkWidget';
import { StickyNoteWidget } from './stickyNote/StickyNoteWidget';
import { WhiteboardWidget } from './whiteboard/WhiteboardWidget';
import { YoutubeWidget } from './youtube/YoutubeWidget';
import { ScreenShareWidget } from './sidecarStream/SidecarStreamWidget';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { WidgetShape, WidgetShapeForType, WidgetStateByType, WidgetType } from '../../../roomState/types/widgets';
import { MockUserWidget } from './mockUser/MockUserWidget';
import { useDeleteWidget } from './useDeleteWidget';
import { useSaveWidget } from './useSaveWidget';
import { logger } from '../../../utils/logger';

export type WidgetContextValue<T extends WidgetType> = {
  widget: WidgetShapeForType<T>;
  save: (state: Partial<WidgetStateByType[T]>) => void;
  remove: () => void;
};
export const WidgetContext = React.createContext<WidgetContextValue<any> | null>(null);

export interface IWidgetProps {
  id: string;
}

/**
 * Pulls a Widget from the store by id and renders it as a draggable object
 * within a Room.
 */
export const Widget = React.memo<IWidgetProps>(({ id }) => {
  const widget = useRoomStore(React.useCallback((room) => room.widgets[id], [id]));
  const handleRemove = useDeleteWidget(id);
  const handleSave = useSaveWidget(id);

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

  return (
    <WidgetContext.Provider value={ctx}>
      <WidgetContent widget={widget} />
    </WidgetContext.Provider>
  );
});

interface IWidgetContentProps {
  widget: WidgetShape & { ownerId: string };
}

/**
 * Renders any Widget content, deciding how to render based on the
 * Widget's `type`.
 */
const WidgetContent = React.memo<IWidgetContentProps>(({ widget }) => {
  switch (widget.type) {
    case WidgetType.Link:
      return <LinkWidget />;
    case WidgetType.StickyNote:
      return <StickyNoteWidget />;
    case WidgetType.Whiteboard:
      return <WhiteboardWidget />;
    case WidgetType.YouTube:
      return <YoutubeWidget />;
    case WidgetType.SidecarStream:
      return <ScreenShareWidget />;
    case WidgetType.MockUser:
      return <MockUserWidget />;
    default:
      logger.debug(`Rendered unknown widget type: ${(widget as any).type}`);
      return null;
  }
});
