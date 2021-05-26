import * as React from 'react';
import { ListItemIcon, ListItemText, ListItem } from '@material-ui/core';
import { useRoomModalStore } from '../../useRoomModalStore';
import { UserIcon } from '@components/icons/UserIcon';
import { useAnalytics, IncludeData } from '@hooks/useAnalytics/useAnalytics';
import { EventNames } from '@analytics/constants';

export interface IUserSettingsMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const UserSettingsMenuItem = React.forwardRef<HTMLDivElement, IUserSettingsMenuItemProps>(
  ({ children, onClick, ...rest }, ref) => {
    const openModal = useRoomModalStore((room) => room.api.openModal);
    const { trackEvent } = useAnalytics([IncludeData.roomId]);

    return (
      <ListItem
        ref={ref}
        onClick={() => {
          trackEvent(EventNames.BUTTON_CLICKED, { name: 'user_settings' });
          openModal('userSettings');
          onClick?.();
        }}
        button
        {...rest}
      >
        <ListItemIcon>
          <UserIcon />
        </ListItemIcon>
        <ListItemText primary={children} />
      </ListItem>
    );
  }
);
