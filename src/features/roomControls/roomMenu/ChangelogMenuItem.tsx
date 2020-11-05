import * as React from 'react';
import { MenuItem, ListItemText } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { actions as controlsActions } from '../roomControlsSlice';

export interface IChangelogMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const ChangelogMenuItem = React.forwardRef<HTMLLIElement, IChangelogMenuItemProps>((props, ref) => {
  // we don't want to sync this state to peers.
  const dispatch = useDispatch();

  return (
    <MenuItem
      ref={ref}
      onClick={() => {
        dispatch(controlsActions.setIsChangelogModalOpen({ isOpen: true }));
        props.onClick?.();
      }}
      dense
    >
      <ListItemText primary={props.children} />
    </MenuItem>
  );
});
