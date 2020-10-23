import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { actions as roomActions } from '../../roomSlice';
import { SettingsIcon } from '../../../../withComponents/icons/SettingsIcon';

export interface IRoomSettingsMenuItemProps {
  onClick?: () => void;
}

const useStyles = makeStyles((theme) => ({
  text: {
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

export const RoomSettingsMenuItem = React.forwardRef<HTMLLIElement, IRoomSettingsMenuItemProps>((props, ref) => {
  const classes = useStyles();

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
      <ListItemText primaryTypographyProps={{ className: classes.text }}>Room Settings</ListItemText>
    </MenuItem>
  );
});
