import * as React from 'react';
import { ConnectionFailedError, SocketConnection, SocketMessageRejectionError } from './SocketConnection';
import { Snackbar } from '@material-ui/core';
import { useIsMountedRef } from '../hooks/useIsMountedRef/useIsMountedRef';
import { logger } from '../utils/logger';
import { ErrorPage } from '../pages/ErrorPage/ErrorPage';
import { ErrorCodes } from '../constants/ErrorCodes';
import { IncomingAuthResponseMessage } from './types/socketProtocol';
import { useRoomStore } from './useRoomStore';
import { useHistory } from 'react-router';
import { RouteNames } from '../constants/RouteNames';
import { getSessionToken } from '../utils/sessionToken';
import { useTranslation } from 'react-i18next';
import { Alert, AlertTitle } from '@material-ui/lab';
import { FullscreenLoading } from '../components/FullscreenLoading/FullscreenLoading';

const WS_SERVER = process.env.REACT_APP_SOCKET_HOST || 'wss://test.with.so:8443';
const AUTH_RESPONSE_TIMEOUT = 10 * 1000; // 10 seconds

export interface IRoomStateProviderProps {
  roomName: string;
}

const useSocketConnection = (roomName: string) => {
  const { t } = useTranslation();

  // tracking mounted state helps avoid the "set state on unmounted component"
  // error - we wrap any set state calls with a check to see if the mounted
  // flag is true.
  const isMountedRef = useIsMountedRef();

  const history = useHistory();

  const [error, setError] = React.useState<Error | null>(null);
  const [ready, setReady] = React.useState(false);
  const [reconnecting, setReconnecting] = React.useState(false);

  // The connect function allows us to hook our socket up to the
  // room state store
  const connect = useRoomStore((store) => store.api.connect);

  React.useEffect(() => {
    logger.debug('Initializing socket connection');
    const sock = new SocketConnection(WS_SERVER);

    // connect to the store and begin processing events
    connect(sock);

    sock.on('error', (err) => {
      if (err) logger.error(err);
      if (isMountedRef.current) {
        // this error indicates the socket completely failed to connect after
        // automatic reconnection attempts failed
        if (err && err instanceof ConnectionFailedError) {
          setError(new Error(t('error.messages.socketUnavailable')));
        }
      }
    });

    sock.on('closed', () => {
      if (isMountedRef.current) setReconnecting(true);
    });
    // the SocketConnection can disconnect and auto-reconnect at any time -
    // so each time it connects, we trigger authentication and state rehydration
    sock.on('connected', async () => {
      // authenticate the socket and wait for response
      try {
        setError(null);
        setReconnecting(false);

        const sessionToken = getSessionToken();
        if (!sessionToken) {
          throw new Error(t('errors.unauthorized'));
        }

        // authenticate and wait for response - this will automatically
        // trigger state rehydration when the server responds, which is
        // handled in the room store message handler paths
        await sock.sendAndWaitForResponse<IncomingAuthResponseMessage>(
          {
            kind: 'auth',
            payload: {
              roomName,
              token: sessionToken,
            },
          },
          AUTH_RESPONSE_TIMEOUT
        );

        if (isMountedRef.current) {
          setReady(true);
        }
      } catch (err) {
        logger.error(err);

        if (err instanceof SocketMessageRejectionError && err.code === 'AUTH_FAILED') {
          // user is not logged in
          history.push(RouteNames.SIGN_IN, { returnTo: history.location.pathname });
        } else if (isMountedRef.current) {
          setError(err);
        }
      }
    });

    return () => {
      sock.removeAllListeners();
      sock.close();
    };
  }, [roomName, isMountedRef, connect, history, t]);

  return { ready, error, reconnecting };
};

/**
 * Manages websocket connection state
 */
export const RoomStateProvider: React.FC<IRoomStateProviderProps> = ({ roomName, children }) => {
  const { ready, error, reconnecting } = useSocketConnection(roomName);

  if (error) {
    return <ErrorPage type={ErrorCodes.UNEXPECTED} errorMessage={error.message} data-testid="roomStateError" />;
  }

  if (!ready) {
    return <FullscreenLoading data-testid="roomStateLoading" />;
  }

  return (
    <>
      {children}
      <ReconnectingAlert visible={reconnecting} />
    </>
  );
};

const ReconnectingAlert = ({ visible }: { visible: boolean }) => {
  const { t } = useTranslation();

  return (
    <Snackbar open={visible} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
      <Alert severity="info" data-testid="roomStateReconnecting">
        <AlertTitle>{t('error.messages.socketReconnectingTitle')}</AlertTitle>
        {t('error.messages.socketReconnectingDetails')}
      </Alert>
    </Snackbar>
  );
};
