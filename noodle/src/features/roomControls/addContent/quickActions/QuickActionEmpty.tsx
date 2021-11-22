import * as React from 'react';
import { Typography, useMediaQuery, Theme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export const QuickActionEmpty = () => {
  const { t } = useTranslation();
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  return (
    <Typography variant="body1" color="textSecondary" style={{ marginBottom: 4 }}>
      {isSmall ? t('features.omnibar.quickActionEmptyMobile') : t('features.omnibar.quickActionEmpty')}
    </Typography>
  );
};
