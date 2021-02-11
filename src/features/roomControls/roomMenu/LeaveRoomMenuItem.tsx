import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../../constants/RouteNames';
import { LeaveIcon } from '../../../components/icons/LeaveIcon';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useRoomStore } from '../../../roomState/useRoomStore';

export interface ILeaveRoomMenuItemProps {}

export const LeaveRoomMenuItem = React.forwardRef<HTMLLIElement, ILeaveRoomMenuItemProps>(
  ({ children, ...rest }, ref) => {
    const { room } = useVideoContext();
    const history = useHistory();
    const leave = useRoomStore((r) => r.api.leave);
    const leaveRoom = React.useCallback(() => {
      room?.disconnect();
      leave();
      history.push(RouteNames.ROOT);
    }, [history, room, leave]);

    return (
      <MenuItem onClick={leaveRoom} ref={ref} {...rest}>
        <ListItemIcon>
          <LeaveIcon />
        </ListItemIcon>
        <ListItemText primary={children} />
      </MenuItem>
    );
  }
);
