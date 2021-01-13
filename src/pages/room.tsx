import React from 'react';
import ErrorDialog from '../components/ErrorDialog/ErrorDialog';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ReconnectingNotification from '../components/ReconnectingNotification/ReconnectingNotification';
import { Room } from '../features/room/Room';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { VideoProvider } from '../components/VideoProvider';
import { ConnectOptions } from 'twilio-video';
import { LocalTracksProvider } from '../components/LocalTracksProvider/LocalTracksProvider';
import { useTranslation } from 'react-i18next';
import { Modal } from '../components/Modal/Modal';
import { ModalTitleBar } from '../components/Modal/ModalTitleBar';
import { ModalContentWrapper } from '../components/Modal/ModalContentWrapper';
import { RoomStateProvider } from '../roomState/RoomStateProvider';
import { useAppState } from '../state';
import { RemoteControlProvider } from '../components/RemoteControlProvider/RemoteControlProvider';

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
  dominantSpeaker: false,
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
interface IRoomPageProps {
  name: string;
}

export default function RoomPage(props: IRoomPageProps) {
  const classes = useStyles();
  const { error, setError } = useAppState();

  return (
    <>
      <ErrorDialog dismissError={() => setError(null)} error={error} />
      <RoomStateProvider roomName={props.name}>
        <LocalTracksProvider>
          <VideoProvider options={connectionOptions} onError={setError} roomName={props.name}>
            <RemoteControlProvider>
              <div className={classes.roomWrapper}>
                <ErrorBoundary fallback={() => <RoomFallback />}>
                  <Room />
                  <ReconnectingNotification />
                </ErrorBoundary>
              </div>
            </RemoteControlProvider>
          </VideoProvider>
        </LocalTracksProvider>
      </RoomStateProvider>
    </>
  );
}
