import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { SettingsIcon } from '../../../components/icons/SettingsIcon';
import { useRoomModalStore } from '../useRoomModalStore';

export interface IUserSettingsMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const UserSettingsMenuItem = React.forwardRef<HTMLLIElement, IUserSettingsMenuItemProps>((props, ref) => {
  const openModal = useRoomModalStore((room) => room.api.openModal);

  return (
    <MenuItem
      ref={ref}
      onClick={() => {
        openModal('userSettings');
        props.onClick?.();
      }}
    >
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary={props.children} />
    </MenuItem>
  );
});
