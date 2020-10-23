import * as React from 'react';
import { Button, Menu, makeStyles } from '@material-ui/core';
import { DropdownIcon } from '../../../../withComponents/icons/DropdownIcon';
import { RoomSettingsMenuItem } from './RoomSettingsMenuItem';
import { useRoomName } from '../../../../withHooks/useRoomName/useRoomName';

const useStyles = makeStyles((theme) => ({
  button: {
    height: 40,
    fontWeight: theme.typography.fontWeightBold,
  },
}));

export const RoomMenu = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const onClose = () => setAnchorEl(null);

  const roomName = useRoomName();

  return (
    <>
      <Button
        variant="text"
        endIcon={<DropdownIcon />}
        onClick={(ev) => setAnchorEl(ev.currentTarget)}
        color="inherit"
        className={classes.button}
      >
        {roomName || 'Room'}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
        <RoomSettingsMenuItem onClick={onClose} />
      </Menu>
    </>
  );
};
