import * as React from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../../constants/RouteNames';
import { LeaveIcon } from '../../../components/icons/LeaveIcon';
import { useDispatch } from 'react-redux';
import { actions } from '../../room/roomSlice';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

export interface ILeaveRoomMenuItemProps {}

export const LeaveRoomMenuItem: React.FC<ILeaveRoomMenuItemProps> = (props) => {
  const dispatch = useDispatch();
  const { room } = useVideoContext();
  const history = useHistory();
  const leaveRoom = React.useCallback(() => {
    room?.disconnect();
    dispatch(actions.leave());
    history.push(RouteNames.ROOT);
  }, [history, room, dispatch]);

  return (
    <MenuItem onClick={leaveRoom}>
      <ListItemIcon>
        <LeaveIcon />
      </ListItemIcon>
      <ListItemText primary={props.children} />
    </MenuItem>
  );
};
