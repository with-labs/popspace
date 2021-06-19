import * as React from 'react';
import clsx from 'clsx';
import { useTwilio } from '@providers/twilio/TwilioProvider';
import { LeaveIcon } from '@components/icons/LeaveIcon';
import { makeStyles, Button, Hidden, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import client from '@api/client';
import { useHistory } from 'react-router';

export interface ILeaveMeetingButtonProps {}

const useStyles = makeStyles((theme) => ({
  buttonColor: {
    color: theme.palette.brandColors.cherry.bold,
    '&:hover:not($active)': {
      backgroundColor: theme.palette.brandColors.cherry.light,
    },
  },
  button: {
    paddingRight: 0,
    paddingLeft: 15,
    minWidth: 170,
  },
  iconButton: {
    borderRadius: theme.shape.contentBorderRadius,
  },
}));

// TODO: addin in analytics
export const LeaveMeetingButton: React.FC<ILeaveMeetingButtonProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { room } = useTwilio();

  // todo add analytics
  const history = useHistory();
  const leaveRoom = React.useCallback(() => {
    room?.disconnect();
    client.leaveMeeting();
    history.push(`${history.location.pathname}/post_meeting`);
  }, [room, history]);

  return (
    <>
      <Hidden smDown>
        <Button
          variant="text"
          className={clsx(classes.buttonColor, classes.button)}
          startIcon={<LeaveIcon />}
          onClick={leaveRoom}
          fullWidth={false}
        >
          {t('features.roomControls.leaveMeetingButtonText')}
        </Button>
      </Hidden>
      <Hidden mdUp>
        <IconButton className={classes.buttonColor} classes={{ root: classes.iconButton }} onClick={leaveRoom}>
          <LeaveIcon />
        </IconButton>
      </Hidden>
    </>
  );
};
