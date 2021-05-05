import * as React from 'react';
import { ListItemIcon, ListItemText, ListItem } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '../../../../constants/RouteNames';
import { LeaveIcon } from '../../../../components/icons/LeaveIcon';
import { useRoomStore } from '../../../../roomState/useRoomStore';
import { useTwilio } from '../../../../providers/twilio/TwilioProvider';
import { useAnalytics, IncludeData } from '../../../../hooks/useAnalytics/useAnalytics';
import { EventNames } from '../../../../analytics/constants';

export interface ILeaveRoomMenuItemProps {}

export const LeaveRoomMenuItem = React.forwardRef<HTMLDivElement, ILeaveRoomMenuItemProps>(
  ({ children, ...rest }, ref) => {
    const { trackEvent } = useAnalytics([IncludeData.roomId]);

    const { room } = useTwilio();
    const history = useHistory();
    const leave = useRoomStore((r) => r.api.leave);
    const leaveRoom = React.useCallback(() => {
      trackEvent(EventNames.BUTTON_CLICKED, { name: 'dashboard' });
      room?.disconnect();
      leave();
      history.push(RouteNames.ROOT);
    }, [history, room, leave, trackEvent]);

    return (
      <ListItem onClick={leaveRoom} button ref={ref} {...rest}>
        <ListItemIcon>
          <LeaveIcon />
        </ListItemIcon>
        <ListItemText primary={children} />
      </ListItem>
    );
  }
);
