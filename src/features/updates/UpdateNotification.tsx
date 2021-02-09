import { Button, Snackbar } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateStore } from './useUpdatesStore';

export interface IUpdateNotificationProps {}

export const UpdateNotification: React.FC<IUpdateNotificationProps> = () => {
  const { t } = useTranslation();
  const hasUpdate = useUpdateStore((store) => store.hasUpdate);
  const acceptUpdate = useUpdateStore((store) => store.api.onUpdate);

  return (
    <Snackbar open={hasUpdate}>
      <Alert severity="info" action={<Button onClick={acceptUpdate}>{t('features.updates.reload')}</Button>}>
        <AlertTitle>{t('features.updates.title')}</AlertTitle>
        {t('features.updates.description')}
      </Alert>
    </Snackbar>
  );
};
