import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { actions as controlsActions } from '../roomControlsSlice';
import { AddIcon } from '../../../components/icons/AddIcon';

export interface IManageMembershipMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const ManageMembershipMenuItem = React.forwardRef<HTMLLIElement, IManageMembershipMenuItemProps>(
  (props, ref) => {
    // we don't want to sync this state to peers.
    const dispatch = useDispatch();

    return (
      <MenuItem
        ref={ref}
        onClick={() => {
          dispatch(controlsActions.setIsMembershipModalOpen({ isOpen: true }));
          props.onClick?.();
        }}
      >
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary={props.children} />
      </MenuItem>
    );
  }
);
