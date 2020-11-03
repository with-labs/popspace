import * as React from 'react';
import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
import { useAddAccessory } from './useAddAccessory';
import { AccessoryIcon } from '../../../components/icons/AccessoryIcon';
import { WidgetType, WidgetData } from '../../../types/room';
import useParticipantDisplayIdentity from '../../../hooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { useTranslation } from 'react-i18next';

const nameKeys: Partial<Record<WidgetType, string>> = {
  [WidgetType.Link]: 'widgets.link.name',
  [WidgetType.StickyNote]: 'widgets.stickyNote.name',
  [WidgetType.Whiteboard]: 'widgets.whiteboard.name',
  [WidgetType.YouTube]: 'widgets.youtube.name',
};

const accessoryEmptyData: Partial<Record<WidgetType, (...args: any[]) => WidgetData>> = {
  [WidgetType.Link]: () => ({
    title: '',
    url: '',
  }),
  [WidgetType.StickyNote]: (authorName: string) => ({
    text: '',
    author: authorName,
  }),
  [WidgetType.Whiteboard]: () => ({
    whiteboardState: {
      lines: [],
    },
  }),
  [WidgetType.YouTube]: () => ({
    videoId: '',
    playStartedTimestampUTC: null,
  }),
};

export interface IAddAccessoryMenuItemProps {
  accessoryType: WidgetType;
  onClick?: () => void;
}

export const AddAccessoryMenuItem = React.forwardRef<HTMLLIElement, IAddAccessoryMenuItemProps>(
  ({ accessoryType, onClick }, ref) => {
    const { t } = useTranslation();

    // TODO: remove when we solve the username disappearing problem using
    // room state and membership persistence
    const userName = useParticipantDisplayIdentity();

    const addWidget = useAddAccessory();
    const handleClick = React.useCallback(() => {
      onClick?.();
      // wrapped in a timeout so that all sync effects of the click are processed and done before
      // the widget is added - this gives time for the menu to close, for example, and move the window
      // focus element back to the button, before the widget is mounted and steals focus (for example,
      // most widget create forms have an autoFocus input)
      setTimeout(() => {
        const initialDataFn = accessoryEmptyData[accessoryType];
        // unsupported accessory types
        if (!initialDataFn) return;
        // whiteboards publish immediately, they have no draft state.
        addWidget({
          type: accessoryType,
          initialData: initialDataFn(userName),
          publishImmediately: accessoryType === WidgetType.Whiteboard,
        });
      });
    }, [accessoryType, addWidget, onClick, userName]);

    return (
      <MenuItem onClick={handleClick} ref={ref}>
        <ListItemIcon>
          <AccessoryIcon fontSize="default" type={accessoryType} />
        </ListItemIcon>
        <ListItemText>{t(nameKeys[accessoryType] || 'widgets.unknown.name')}</ListItemText>{' '}
      </MenuItem>
    );
  }
);
