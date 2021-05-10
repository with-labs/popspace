import React from 'react';
import ErrorDialog from '../../components/ErrorDialog/ErrorDialog';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Room } from '../../features/room/Room';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal/Modal';
import { ModalTitleBar } from '../../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../../components/Modal/ModalContentWrapper';
import { RoomStateProvider } from '../../roomState/RoomStateProvider';
import { useAppState } from '../../state';
import { RemoteControlProvider } from '../../components/RemoteControlProvider/RemoteControlProvider';
import { TwilioProvider } from '../../providers/twilio/TwilioProvider';
import { LocalTracksProvider } from '../../providers/media/LocalTracksProvider';
import { PreRoom } from './PreRoom/PreRoom';
import { MediaReadinessContext } from '../../components/MediaReadinessProvider/MediaReadinessProvider';
import { useHistory } from 'react-router-dom';

import useQueryParams from '../../hooks/useQueryParams/useQueryParams';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  roomWrapper: {
    width: '100vw',
    height: '100vh',
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
  name: string | null;
}

export default function RoomPage(props: IRoomPageProps) {
  const classes = useStyles();
  const { error, setError } = useAppState();
  const { isReady, onReady } = React.useContext(MediaReadinessContext);
  const query = useQueryParams();
  const history = useHistory();

  const isJoining = query.get('join') !== null;

  React.useEffect(() => {
    if (!isReady && !isJoining) {
      if (history.location.search.length > 0) {
        history.replace({
          pathname: history.location.pathname,
          search: `${history.location.search}&join`,
        });
      } else {
        // it means we are hitting a room directly so we need to add the join param
        history.replace({
          pathname: history.location.pathname,
          search: `join`,
        });
      }
    }
  }, [history, isReady, isJoining]);

  const handleOnReady = () => {
    onReady();
    history.push(history.location.pathname);
  };

  return (
    <>
      <ErrorDialog dismissError={() => setError(null)} error={error} />
      <LocalTracksProvider>
        {props.name && isReady ? (
          <RoomStateProvider roomName={props.name}>
            <TwilioProvider roomName={props.name}>
              <RemoteControlProvider>
                <div className={classes.roomWrapper}>
                  <ErrorBoundary fallback={() => <RoomFallback />}>
                    <Room />
                  </ErrorBoundary>
                </div>
              </RemoteControlProvider>
            </TwilioProvider>
          </RoomStateProvider>
        ) : (
          <>
            <PreRoom onReady={handleOnReady} />
          </>
        )}
      </LocalTracksProvider>
    </>
  );
}
