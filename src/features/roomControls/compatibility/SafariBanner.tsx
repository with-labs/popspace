import { FeedbackButton } from '@components/FeedbackButton/FeedbackButton';
import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { isSafari } from 'react-device-detect';
import { Trans } from 'react-i18next';

import { useRoomModalStore } from '../useRoomModalStore';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.mandarin.light,
    color: theme.palette.brandColors.mandarin.ink,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(0.5),
    width: '100%',
  },
  inlineButton: {
    padding: 0,
    display: 'inline',
    border: 'none',
    appearance: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontWeight: theme.typography.fontWeightBold,
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

  if (!isSafari) {
    return null;
  }

  return (
    <div className={classes.root}>
      <Trans i18nKey="pages.room.safariBanner">
        Safari support is in preview. Help us improve by&nbsp;
        <FeedbackButton className={classes.inlineButton}>reporting bugs</FeedbackButton>, or switch to a&nbsp;
        <button className={classes.inlineButton} onClick={openBrowsersModal}>
          supported browser
        </button>
        .
      </Trans>
    </div>
  );
}
