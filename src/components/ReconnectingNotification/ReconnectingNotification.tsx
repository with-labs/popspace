import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import { RoomState } from '../../constants/twilio';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';

export default function ReconnectingNotification() {
  const { t } = useTranslation();
  const roomState = useRoomState();

  return (
    <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} open={roomState === RoomState.Reconnecting}>
      <Alert severity="info">
        <AlertTitle>{t('error.messages.mediaReconnectingTitle')}</AlertTitle>
        {t('error.messages.mediaReconnectingDetails')}
      </Alert>
    </Snackbar>
  );
}
