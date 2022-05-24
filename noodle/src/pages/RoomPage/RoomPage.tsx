import React, { useState } from 'react';
import ErrorDialog from '@components/ErrorDialog/ErrorDialog';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Room } from '@features/room/Room';
import { ErrorBoundary } from '@components/ErrorBoundary/ErrorBoundary';
import { useTranslation } from 'react-i18next';
import { Modal } from '@components/Modal/Modal';
import { ModalTitleBar } from '@components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '@components/Modal/ModalContentWrapper';
import { useAppState } from '../../state';
import { RemoteControlProvider } from '@components/RemoteControlProvider/RemoteControlProvider';
import { ApiError } from '@src/errors/ApiError';
import { ErrorCodes } from '@constants/ErrorCodes';
import { NotFoundPage } from '../NotFoundPage';
import { logger } from '@utils/logger';
import { media, readyPromise } from '@src/media';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    width: '100vw',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  roomWrapper: {
    width: '100vw',
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.brandColors.slate.ink,
  },
}));

const RoomFallback = () => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={true} maxWidth="sm">
      <ModalTitleBar title={t('error.unexpectedModal.title')} />
      <ModalContentWrapper>
        <Typography variant="body1">{t('error.unexpectedModal.msg')}</Typography>
      </ModalContentWrapper>
    </Modal>
  );
};
interface IRoomPageProps {
  roomRoute: string;
}

export default function RoomPage(props: IRoomPageProps) {
  const classes = useStyles();
  const { error, setError } = useAppState();
  const [notFound, setNotFound] = useState(false);

  React.useEffect(() => {
    readyPromise.then((providers: Record<string, any>) => {
      const providerName = Object.keys(providers)[0];
      // something's wrong with the typing :(
      (media.connect as any)({ roomRoute: props.roomRoute, providerName }).catch((err: any) => {
        if (err instanceof ApiError) {
          if (err.errorCode === ErrorCodes.ROOM_NOT_FOUND || err.errorCode === ErrorCodes.UNKNOWN_ROOM) {
            setNotFound(true);
            return;
          }
        }
        logger.error(err);
        setError(err);
      });
    });
  }, [props.roomRoute, setError]);
  React.useEffect(() => {
    return () => {
      media.disconnect();
    };
  }, []);

  if (notFound) {
    return <NotFoundPage />;
  }

  return (
    <>
      <ErrorDialog dismissError={() => setError(null)} error={error} />
      <RemoteControlProvider>
        <div className={classes.roomWrapper}>
          <ErrorBoundary fallback={() => <RoomFallback />}>
            <Room />
          </ErrorBoundary>
        </div>
      </RemoteControlProvider>
    </>
  );
}
