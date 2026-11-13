import * as React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { RemoveCircleOutline } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { makeStyles, useTheme } from '@material-ui/core';
import client from '@api/client';
import { media } from '@src/media';
import { useIsDoNotDisturb } from '@hooks/useDoNotDisturb/useDoNotDisturb';

const useStyles = makeStyles((theme) => ({
  text: {
    color: theme.palette.brandColors.ink.regular,
    paddingLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

/**
 * Do not disturb: turns off camera, microphone and screen share, keeps them
 * off, mutes everyone else for this user and shows the status to others.
 */
export const DoNotDisturbToggle = (props: { className?: string }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const doNotDisturb = useIsDoNotDisturb();

  const toggle = () => {
    if (!doNotDisturb) {
      media.stopMicrophone();
      media.stopCamera();
      media.stopScreenShare();
    }
    client.participants.updateDoNotDisturb(!doNotDisturb);
  };

  return (
    <ResponsiveTooltip title={t('features.mediaControls.doNotDisturbToggle') as string}>
      <span>
        <ToggleButton
          value="doNotDisturb"
          selected={doNotDisturb}
          onChange={toggle}
          data-test-id="toggleDoNotDisturb"
          {...props}
        >
          <RemoveCircleOutline
            fontSize="default"
            htmlColor={doNotDisturb ? theme.palette.brandColors.cherry.bold : theme.palette.brandColors.ink.regular}
          />
          <span className={classes.text}>{t('features.mediaControls.doNotDisturbTitle')}</span>
        </ToggleButton>
      </span>
    </ResponsiveTooltip>
  );
};
