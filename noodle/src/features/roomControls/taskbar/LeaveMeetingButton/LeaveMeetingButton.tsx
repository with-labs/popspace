import * as React from 'react';
import clsx from 'clsx';
import { LeaveIcon } from '@components/icons/LeaveIcon';
import { makeStyles, Button, Hidden, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import client from '@api/client';
import { useHistory } from 'react-router';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { EventNames } from '@analytics/constants';
import { Analytics } from '@analytics/Analytics';

export interface ILeaveMeetingButtonProps {}

const useStyles = makeStyles((theme) => ({
  buttonColor: {
    color: theme.palette.brandColors.cherry.bold,
    '&:hover:not(.active)': {
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

export const LeaveMeetingButton: React.FC<ILeaveMeetingButtonProps> = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();

  const leaveRoom = React.useCallback(() => {
    Analytics.trackEvent(EventNames.LEAVE_ROOM_BUTTON_PRESSED);
    client.leaveMeeting();
    history.push(`${history.location.pathname}/post_meeting`);
  }, [history]);

  return (
    <>
      <Hidden mdDown>
        <Button
          variant="text"
          className={clsx(classes.buttonColor, classes.button)}
          startIcon={<LeaveIcon />}
          onClick={leaveRoom}
          fullWidth={false}
          data-test-id="leaveMeeting"
        >
          {t('features.roomControls.leaveMeetingButtonText')}
        </Button>
      </Hidden>
      <Hidden lgUp>
        <ResponsiveTooltip title={t('features.roomControls.leaveMeetingButtonText') as string}>
          <IconButton
            className={classes.buttonColor}
            classes={{ root: classes.iconButton }}
            onClick={leaveRoom}
            data-test-id="leaveMeeting"
          >
            <LeaveIcon />
          </IconButton>
        </ResponsiveTooltip>
      </Hidden>
    </>
  );
};
