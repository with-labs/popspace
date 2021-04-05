import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useRoomStatus } from './hooks/useRoomStatus';
import { TwilioStatus } from './TwilioProvider';

export default function ReconnectingNotification() {
  const { t } = useTranslation();
  const roomState = useRoomStatus();

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={roomState === TwilioStatus.Reconnecting}
    >
      <Alert severity="info">
        <AlertTitle>{t('error.messages.mediaReconnectingTitle')}</AlertTitle>
        {t('error.messages.mediaReconnectingDetails')}
      </Alert>
    </Snackbar>
  );
}
