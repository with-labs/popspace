import * as React from 'react';
import { Button, Menu } from '@material-ui/core';
import { DropdownIcon } from '../../../../withComponents/icons/DropdownIcon';
import { RoomSettingsMenuItem } from './RoomSettingsMenuItem';
import { useRoomName } from '../../../../withHooks/useRoomName/useRoomName';

export const RoomMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const onClose = () => setAnchorEl(null);

  const roomName = useRoomName();

  return (
    <>
      <Button variant="text" endIcon={<DropdownIcon />} onClick={(ev) => setAnchorEl(ev.currentTarget)} color="inherit">
        {roomName || 'Room'}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
        <RoomSettingsMenuItem onClick={onClose} />
      </Menu>
    </>
  );
};
