import * as React from 'react';
import { addVectors } from '../../../../utils/math';
import { useRoomViewport } from '../../RoomViewport';
import { AddIcon } from '../../../../components/icons/AddIcon';
import { useTranslation } from 'react-i18next';
import { WidgetType } from '../../../../roomState/types/widgets';
import { useRoomStore } from '../../../../roomState/useRoomStore';
import { useCurrentUserProfile } from '../../../../hooks/api/useCurrentUserProfile';
import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
import { useWidgetContext } from '../useWidgetContext';
import { Origin } from '../../../../analytics/constants';

export interface IAddNoteMenuItemProps {}

export const AddNoteMenuItem = React.forwardRef<HTMLLIElement, IAddNoteMenuItemProps>((props, ref) => {
  const { t } = useTranslation();
  const { user } = useCurrentUserProfile();
  const userId = user?.id ?? null;

  const {
    widget: { widgetId: parentId },
  } = useWidgetContext();

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
      addWidget(
        {
          widgetState: {
            text: '',
          },
          transform: {
            position,
          },
          type: WidgetType.StickyNote,
        },
        Origin.WIDGET_MENU
      );
    }
  }, [currentPosition, toWorldCoordinate, userId, addWidget]);

  return (
    <MenuItem onClick={handleCreateNew} ref={ref} {...props}>
      <ListItemIcon>
        <AddIcon />
      </ListItemIcon>
      <ListItemText primary={t('widgets.stickyNote.quickAddButton')} />
    </MenuItem>
  );
});
