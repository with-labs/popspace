import { Banner } from '@components/Banner/Banner';
import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { isMobile, isSafari } from 'react-device-detect';
import { Trans } from 'react-i18next';


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

  if (!isSafari || isMobile) {
    return null;
  }

  return (
    <Banner>
      <Trans i18nKey="pages.room.safariBanner">
        Safari support is in preview.
      </Trans>
    </Banner>
  );
}
