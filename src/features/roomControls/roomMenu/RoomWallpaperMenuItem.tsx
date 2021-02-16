import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { useRoomModalStore } from '../useRoomModalStore';
import { WallpaperIcon } from '../../../components/icons/WallpaperIcon';

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
        <WallpaperIcon />
      </ListItemIcon>
      <ListItemText primary={props.children} />
    </MenuItem>
  );
});
