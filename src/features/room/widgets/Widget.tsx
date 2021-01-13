import * as React from 'react';
import { LinkWidget } from './link/LinkWidget';
import { StickyNoteWidget } from './stickyNote/StickyNoteWidget';
import { WhiteboardWidget } from './whiteboard/WhiteboardWidget';
import { YoutubeWidget } from './youtube/YoutubeWidget';
import { ScreenShareWidget } from './sidecarStream/SidecarStreamWidget';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { WidgetShape, WidgetType } from '../../../roomState/types/widgets';

export interface IWidgetProps {
  id: string;
}

/**
 * Pulls a Widget from the store by id and renders it as a draggable object
 * within a Room.
 */
export const Widget = React.memo<IWidgetProps>(({ id }) => {
  const widget = useRoomStore(React.useCallback((room) => room.widgets[id], [id]));
  const deleteWidget = useRoomStore((room) => room.api.deleteWidget);

  const handleRemove = React.useCallback(() => {
    deleteWidget({ widgetId: id });
  }, [deleteWidget, id]);

  if (!widget) {
    // FIXME: why are widgets which arent in the store sometimes being rendered?
    return null;
  }

  return <WidgetContent widget={widget} onClose={handleRemove} />;
});

interface IWidgetContentProps {
  widget: WidgetShape & { ownerId: string };
  onClose: () => void;
}

/**
 * Renders any Widget content, deciding how to render based on the
 * Widget's `type`.
 */
const WidgetContent = React.memo<IWidgetContentProps>(({ widget, onClose }) => {
  switch (widget.type) {
    case WidgetType.Link:
      return <LinkWidget state={widget} onClose={onClose} />;
    case WidgetType.StickyNote:
      return <StickyNoteWidget state={widget} onClose={onClose} />;
    case WidgetType.Whiteboard:
      return <WhiteboardWidget state={widget} onClose={onClose} />;
    case WidgetType.YouTube:
      return <YoutubeWidget state={widget} onClose={onClose} />;
    case WidgetType.SidecarStream:
      return <ScreenShareWidget state={widget} onClose={onClose} />;
  }
});
