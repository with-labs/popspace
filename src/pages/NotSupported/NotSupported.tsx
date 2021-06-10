import * as React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CenterColumnPage } from '../../Layouts/CenterColumnPage/CenterColumnPage';

export interface INotSupportedProps {}

const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
  },
}));

export const NotSupported: React.FC<INotSupportedProps> = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <CenterColumnPage>
      <Typography variant="h1" className={classes.title}>
        {t('pages.notSupported.title')}
      </Typography>
      <Typography variant="body1">{t('pages.notSupported.body')}</Typography>
    </CenterColumnPage>
  );
};
