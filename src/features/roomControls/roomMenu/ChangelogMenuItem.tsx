import * as React from 'react';
import { MenuItem, ListItemText } from '@material-ui/core';
import { useRoomModalStore } from '../useRoomModalStore';

export interface IChangelogMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const ChangelogMenuItem = React.forwardRef<HTMLLIElement, IChangelogMenuItemProps>((props, ref) => {
  const openModal = useRoomModalStore((modals) => modals.api.openModal);

  return (
    <MenuItem
      ref={ref}
      onClick={() => {
        openModal('changelog');
        props.onClick?.();
      }}
      dense
    >
      <ListItemText primary={props.children} />
    </MenuItem>
  );
});
