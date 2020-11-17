import React, { FC } from 'react';
import ErrorDialog from '../components/ErrorDialog/ErrorDialog';
import { CircularProgress, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import JoinRoom from '../components/JoinRoom/JoinRoom';
import ReconnectingNotification from '../components/ReconnectingNotification/ReconnectingNotification';
import { Room } from '../features/room/Room';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import useRoomState from '../hooks/useRoomState/useRoomState';
import { Provider } from 'react-redux';
import store from '../state/store';
import { VideoProvider } from '../components/VideoProvider';
import { ConnectOptions } from 'twilio-video';
import { CoordinatedDispatchProvider } from '../features/room/CoordinatedDispatchProvider';
import { MediaDeviceSynchronizer } from '../features/preferences/MediaDeviceSynchronizer';
import { useCanEnterRoom } from '../hooks/useCanEnterRoom/useCanEnterRoom';
import { useTranslation } from 'react-i18next';

import { Modal } from '../components/Modal/Modal';
import { ModalTitleBar } from '../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../components/Modal/ModalContentWrapper';

// See: https://media.twiliocdn.com/sdk/js/video/releases/2.0.0/docs/global.html#ConnectOptions
// for available connection options.
const connectionOptions: ConnectOptions = {
  bandwidthProfile: {
    video: {
      mode: 'collaboration',
      renderDimensions: {
        high: { height: 1080, width: 1920 },
        standard: { height: 90, width: 160 },
        low: { height: 90, width: 160 },
      },
    },
  },
  dominantSpeaker: true,
  maxAudioBitrate: 48000,
  networkQuality: { local: 1, remote: 1 },
  preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
};

interface IAppProps {
  roomName: string;
}

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

const InnerApp: FC<IAppProps> = ({ roomName }) => {
  const classes = useStyles();

  const roomState = useRoomState();

  const canEnterRoom = useCanEnterRoom();

  if (roomState === 'disconnected') {
    return <JoinRoom roomName={roomName} />;
  }

  if (!canEnterRoom) {
    // still waiting on additional setup after join - this usually means there
    // are already people in the room and we are waiting on an initial state snapshot.
    // In the future this might wait on a state hydration from the server.
    return (
      <div className={classes.backdrop}>
        <CircularProgress style={{ margin: 'auto' }} />
      </div>
    );
  }

  return (
    <div className={classes.roomWrapper}>
      <ErrorBoundary fallback={() => <RoomFallback />}>
        <Room />
        <ReconnectingNotification />
      </ErrorBoundary>
      <MediaDeviceSynchronizer />
    </div>
  );
};

interface IRoomPageProps {
  name: string;
  error: any;
  setError: any;
}

export default function RoomPage(props: IRoomPageProps) {
  return (
    <>
      <ErrorDialog dismissError={() => props.setError(null)} error={props.error} />
      <Provider store={store}>
        <VideoProvider options={connectionOptions} onError={props.setError}>
          <CoordinatedDispatchProvider>
            <InnerApp roomName={props.name} />
          </CoordinatedDispatchProvider>
        </VideoProvider>
      </Provider>
    </>
  );
}
