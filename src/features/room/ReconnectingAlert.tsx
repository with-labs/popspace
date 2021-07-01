import client from '@api/client';
import { Snackbar } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ReconnectingAlert = () => {
  const { t } = useTranslation();

  const [connected, setConnected] = useState(client.socket.isConnected);
  useEffect(() => {
    const onConnected = () => {
      setConnected(true);
    };
    const onDisconnected = () => {
      setConnected(false);
    };

    client.socket.on('connected', onConnected);
    client.socket.on('disconnected', onDisconnected);

    return () => {
      client.socket.off('connected', onConnected);
      client.socket.off('disconnected', onDisconnected);
    };
  }, []);

  return (
    <Snackbar open={!connected} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity="info" data-testid="roomStateReconnecting">
        <AlertTitle>{t('error.messages.socketReconnectingTitle')}</AlertTitle>
        {t('error.messages.socketReconnectingDetails')}
      </Alert>
    </Snackbar>
  );
};
