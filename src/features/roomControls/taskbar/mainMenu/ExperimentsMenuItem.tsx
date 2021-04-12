import * as React from 'react';
import { ListItemIcon, ListItemText, ListItem } from '@material-ui/core';
import { useRoomModalStore } from '../../useRoomModalStore';
import { Flag } from '@material-ui/icons';

export interface IExperimentsMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const ExperimentsMenuItem = React.forwardRef<HTMLDivElement, IExperimentsMenuItemProps>(
  ({ children, onClick, ...rest }, ref) => {
    const openModal = useRoomModalStore((room) => room.api.openModal);

    return (
      <ListItem
        ref={ref}
        onClick={() => {
          openModal('experiments');
          onClick?.();
        }}
        button
        {...rest}
      >
        <ListItemIcon>
          <Flag />
        </ListItemIcon>
        <ListItemText primary={children} />
      </ListItem>
    );
  }
);
