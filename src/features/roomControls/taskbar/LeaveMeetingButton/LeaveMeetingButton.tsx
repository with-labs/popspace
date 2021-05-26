import * as React from 'react';
import { useTwilio } from '@providers/twilio/TwilioProvider';
import { useRoomStore } from '@roomState/useRoomStore';
import { LeaveIcon } from '@components/icons/LeaveIcon';
import { makeStyles, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export interface ILeaveMeetingButtonProps {}

const useStyles = makeStyles((theme) => ({
  button: {
    minWidth: 190,
    color: theme.palette.brandColors.cherry.bold,
    '&:hover:not($active)': {
      backgroundColor: theme.palette.brandColors.cherry.light,
    },
  },
}));

// TODO: addin in analytics
export const LeaveMeetingButton: React.FC<ILeaveMeetingButtonProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { room } = useTwilio();
  const leave = useRoomStore((r) => r.api.leave);
  const leaveRoom = React.useCallback(() => {
    room?.disconnect();
    leave();
  }, [room, leave]);

  return (
    <Button variant="text" className={classes.button} startIcon={<LeaveIcon />} onClick={leaveRoom}>
      {t('features.roomControls.leaveMeetingButtonText')}
    </Button>
  );
};
