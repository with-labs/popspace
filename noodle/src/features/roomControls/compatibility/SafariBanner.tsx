import { Banner } from '@components/Banner/Banner';
import { FeedbackButton } from '@components/FeedbackButton/FeedbackButton';
import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { isMobile, isSafari } from 'react-device-detect';
import { Trans } from 'react-i18next';

import { useRoomModalStore } from '../useRoomModalStore';

const useStyles = makeStyles((theme) => ({
  inlineButton: {
    padding: 0,
    display: 'inline',
    border: 'none',
    appearance: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontWeight: theme.typography.fontWeightBold as any,
    fontSize: 'inherit',
    fontFamily: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export function SafariBanner() {
  const classes = useStyles();

  const openModal = useRoomModalStore((store) => store.api.openModal);
  const openBrowsersModal = () => openModal('supportedBrowsers');

  if (!isSafari || isMobile) {
    return null;
  }

  return (
    <Banner>
      <Trans i18nKey="pages.room.safariBanner">
        Safari support is in preview. Help us improve by&nbsp;
        <FeedbackButton className={classes.inlineButton}>reporting bugs</FeedbackButton>, or switch to a&nbsp;
        <button className={classes.inlineButton} onClick={openBrowsersModal}>
          supported browser
        </button>
        .
      </Trans>
    </Banner>
  );
}
