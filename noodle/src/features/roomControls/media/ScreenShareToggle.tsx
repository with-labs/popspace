import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { ScreenShareIcon } from '@components/icons/ScreenShareIcon';
import { useTranslation } from 'react-i18next';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { useLocalTrack } from '@src/media/hooks';
import { TrackType } from '@withso/pop-media-sdk';
import { media } from '@src/media';
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
  const isSharingOn = !!useLocalTrack(TrackType.Screen);
  const toggleSharingOn = () => {
    if (isSharingOn) {
      media.stopScreenShare();
    } else {
      media.startScreenShare();
    }
  };
  const theme = useTheme();

  return (
    <ResponsiveTooltip title={t('features.mediaControls.screenShareToggle') as string}>
      <span>
        <ToggleButton
          value="video"
          selected={isSharingOn}
          onChange={toggleSharingOn}
          data-test-id="toggleScreenShare"
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
