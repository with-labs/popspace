import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { useRoomModalStore } from '../useRoomModalStore';
import { UserIcon } from '../../../components/icons/UserIcon';

export interface IUserSettingsMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const UserSettingsMenuItem = React.forwardRef<HTMLLIElement, IUserSettingsMenuItemProps>(
  ({ children, onClick, ...rest }, ref) => {
    const openModal = useRoomModalStore((room) => room.api.openModal);

    return (
      <MenuItem
        ref={ref}
        onClick={() => {
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
      </MenuItem>
    );
  }
);
