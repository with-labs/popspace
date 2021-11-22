import { Fab } from '@material-ui/core';
import * as React from 'react';
import { ActionIcon } from '@components/icons/ActionIcon';
import { useRoomModalStore } from '../useRoomModalStore';

export type FloatingActionBarButtonProps = {
  className?: string;
};

export const FloatingActionBarButton = React.forwardRef<HTMLButtonElement, FloatingActionBarButtonProps>(
  (props, ref) => {
    const openModal = useRoomModalStore((store) => store.api.openModal);
    const onClick = () => openModal('actionBar');

    return (
      <Fab {...props} onClick={onClick} ref={ref} color="inherit">
        <ActionIcon color="inherit" fontSize="large" />
      </Fab>
    );
  }
);
