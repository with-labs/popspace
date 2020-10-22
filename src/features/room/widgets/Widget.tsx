import * as React from 'react';
import { useSelector } from 'react-redux';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import * as roomSlice from '../roomSlice';
import { LinkWidget } from './link/LinkWidget';
import { StickyNoteWidget } from './stickyNote/StickyNoteWidget';
import { WhiteboardWidget } from './whiteboard/WhiteboardWidget';
import { YoutubeWidget } from './youtube/YoutubeWidget';
import { useLocalParticipant } from '../../../withHooks/useLocalParticipant/useLocalParticipant';
import { WidgetState, WidgetType } from '../../../types/room';

export interface IWidgetProps {
  id: string;
}

/**
 * Pulls a Widget from the store by id and renders it as a draggable object
 * within a Room.
 */
export const Widget = React.memo<IWidgetProps>(({ id }) => {
  const localParticipant = useLocalParticipant();
  const widget = useSelector(roomSlice.selectors.createWidgetSelector(id));

  const coordinatedDispatch = useCoordinatedDispatch();
  const handleRemove = React.useCallback(() => {
    coordinatedDispatch(
      roomSlice.actions.removeWidget({
        id,
      })
    );
  }, [coordinatedDispatch, id]);

  // don't show other user's widgets if they're still drafts
  if (widget.isDraft && widget.participantSid !== localParticipant.sid) {
    return null;
  }

  return <WidgetContent widget={widget} onClose={handleRemove} />;
});

interface IWidgetContentProps {
  widget: WidgetState;
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
  }
});
