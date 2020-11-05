import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { actions as controlsActions } from '../roomControlsSlice';
import { SettingsIcon } from '../../../components/icons/SettingsIcon';

export interface IUserSettingsMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const UserSettingsMenuItem = React.forwardRef<HTMLLIElement, IUserSettingsMenuItemProps>((props, ref) => {
  // we don't want to sync this state to peers.
  const dispatch = useDispatch();

  return (
    <MenuItem
      ref={ref}
      onClick={() => {
        dispatch(controlsActions.setIsUserSettingsModalOpen({ isOpen: true }));
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
