import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { actions as roomActions } from '../../room/roomSlice';
import { SettingsIcon } from '../../../components/icons/SettingsIcon';

export interface IRoomWallpaperMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const RoomWallpaperMenuItem = React.forwardRef<HTMLLIElement, IRoomWallpaperMenuItemProps>((props, ref) => {
  // we don't want to sync this state to peers.
  const dispatch = useDispatch();

  return (
    <MenuItem
      ref={ref}
      onClick={() => {
        dispatch(roomActions.setIsWallpaperModalOpen({ isOpen: true }));
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
