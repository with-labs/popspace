import * as React from 'react';
import { addVectors } from '../../../../utils/math';
import { useRoomViewport } from '../../RoomViewport';
import { AddIcon } from '../../../../components/icons/AddIcon';
import { WidgetTitlebarButton } from '../WidgetTitlebarButton';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '../../../../roomState/types/widgets';
import { useRoomStore } from '../../../../roomState/useRoomStore';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';

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
  const { user } = useCurrentUserProfile();
  const userId = user?.id ?? null;

  const { toWorldCoordinate } = useRoomViewport();

  const addWidget = useRoomStore((room) => room.api.addWidget);

  const currentPosition = useRoomStore(
    React.useCallback((room) => room.widgetPositions[parentId ?? '']?.position, [parentId])
  );
  const handleCreateNew = React.useCallback(() => {
    const position = currentPosition
      ? addVectors(currentPosition, { x: 100, y: 100 })
      : toWorldCoordinate({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });

    if (userId) {
      addWidget({
        widgetState: {
          text: '',
        },
        transform: {
          position,
        },
        type: WidgetType.StickyNote,
      });
    }
  }, [currentPosition, toWorldCoordinate, userId, addWidget]);

  return (
    <WidgetTitlebarButton onClick={handleCreateNew} aria-label={t('widgets.stickyNote.quickAddButton')}>
      <AddIcon color="inherit" fontSize="small" />
    </WidgetTitlebarButton>
  );
};
