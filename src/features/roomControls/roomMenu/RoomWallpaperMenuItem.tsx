import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { SettingsIcon } from '../../../components/icons/SettingsIcon';
import { useRoomModalStore } from '../useRoomModalStore';

export interface IRoomWallpaperMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const RoomWallpaperMenuItem = React.forwardRef<HTMLLIElement, IRoomWallpaperMenuItemProps>((props, ref) => {
  const openModal = useRoomModalStore((modals) => modals.api.openModal);

  return (
    <MenuItem
      ref={ref}
      onClick={() => {
        openModal('settings');
        props.onClick?.();
      }}
      button
    >
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary={props.children} />
    </MenuItem>
  );
});
