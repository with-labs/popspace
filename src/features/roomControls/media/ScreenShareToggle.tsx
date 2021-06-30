import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { ScreenShareIcon } from '@components/icons/ScreenShareIcon';
import useScreenShareToggle from '@providers/media/hooks/useScreenShareToggle';
import { useTranslation } from 'react-i18next';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { useRoomStatus } from '@providers/twilio/hooks/useRoomStatus';
import { TwilioStatus } from '@providers/twilio/TwilioProvider';
import { makeStyles, useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  text: {
    color: theme.palette.brandColors.ink.regular,
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

export const ScreenShareToggle = (props: { className?: string }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isSharingOn, toggleSharingOn] = useScreenShareToggle();
  const roomStatus = useRoomStatus();
  const theme = useTheme();

  return (
    <ResponsiveTooltip title={t('features.mediaControls.screenShareToggle') as string}>
      <span>
        <ToggleButton
          value="video"
          selected={isSharingOn}
          onChange={toggleSharingOn}
          disabled={roomStatus !== TwilioStatus.Connected}
          {...props}
        >
          {isSharingOn ? (
            <ScreenShareIcon fontSize="default" htmlColor={theme.palette.brandColors.blueberry.bold} />
          ) : (
            <ScreenShareIcon fontSize="default" />
          )}
          <span className={classes.text}>{t('features.mediaControls.shareTitle')}</span>
        </ToggleButton>
      </span>
    </ResponsiveTooltip>
  );
};
