import * as React from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export const QuickActionEmpty = () => {
  const { t } = useTranslation();

  return (
    <Typography variant="body1" color="textSecondary" style={{ marginBottom: 4 }}>
      {t('features.omnibar.quickActionEmpty')}
    </Typography>
  );
};
