import * as React from 'react';
import { useSelector } from 'react-redux';
import { addVectors } from '../../../../utils/math';
import { useLocalParticipant } from '../../../../withHooks/useLocalParticipant/useLocalParticipant';
import useParticipantDisplayIdentity from '../../../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useCoordinatedDispatch } from '../../CoordinatedDispatchProvider';
import * as roomSlice from '../../roomSlice';
import { useRoomViewport } from '../../RoomViewport';
import { WidgetType } from '../../../../types/room';
import { AddIcon } from '../../../../withComponents/icons/AddIcon';
import { WidgetTitlebarButton } from '../WidgetTitlebarButton';
import { useTranslation } from 'react-i18next';

export interface IAddStickyNoteButtonProps {
  /**
   * ID of the 'originating' sticky note widget, if any.
   * Supplying this ID will spawn the new note near the parent.
   * If not provided or if the parent is not found, the note
   * will default to the center of the user's screen.
   */
  parentId?: string;
}

export const AddStickyNoteButton: React.FC<IAddStickyNoteButtonProps> = ({ parentId }) => {
  const { t } = useTranslation();
  const localParticipant = useLocalParticipant();
  const localDisplayName = useParticipantDisplayIdentity(localParticipant);

  const { toWorldCoordinate } = useRoomViewport();

  const coordinatedDispatch = useCoordinatedDispatch();
  // get the parent position if available, or fallback to null.
  const currentPosition = useSelector(roomSlice.selectors.createPositionSelector(parentId || '')) || null;
  const handleCreateNew = React.useCallback(() => {
    const position = currentPosition
      ? addVectors(currentPosition, { x: 100, y: 100 })
      : toWorldCoordinate({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });

    coordinatedDispatch(
      roomSlice.actions.addWidget({
        widget: {
          kind: 'widget',
          type: WidgetType.StickyNote,
          data: {
            title: '',
            text: '',
            author: localDisplayName || 'Anonymous',
          },
          isDraft: true,
          participantSid: localParticipant.sid,
        },
        position,
      })
    );
  }, [localDisplayName, currentPosition, coordinatedDispatch, localParticipant.sid, toWorldCoordinate]);

  return (
    <WidgetTitlebarButton onClick={handleCreateNew} aria-label={t('widgets.stickyNote.quickAddButton')}>
      <AddIcon color="inherit" fontSize="small" />
    </WidgetTitlebarButton>
  );
};
