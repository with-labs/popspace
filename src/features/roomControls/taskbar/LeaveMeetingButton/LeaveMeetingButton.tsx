import * as React from 'react';
import { useTwilio } from '@providers/twilio/TwilioProvider';
import { LeaveIcon } from '@components/icons/LeaveIcon';
import { makeStyles, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import client from '@api/client';

export interface ILeaveMeetingButtonProps {}

const useStyles = makeStyles((theme) => ({
  button: {
    paddingRight: 0,
    paddingLeft: 15,
    minWidth: 170,
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

  // todo add analytics
  const leaveRoom = React.useCallback(() => {
    room?.disconnect();
    client.leaveMeeting();
  }, [room]);

  return (
    <Button variant="text" className={classes.button} startIcon={<LeaveIcon />} onClick={leaveRoom} fullWidth={false}>
      {t('features.roomControls.leaveMeetingButtonText')}
    </Button>
  );
};
