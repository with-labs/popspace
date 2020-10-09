// copy of the initial twilio code, changed a few things and wanted to keep the
// code separate

import React, { useState, useEffect, FC } from 'react';
import useVideoContext from './hooks/useVideoContext/useVideoContext';
import * as Sentry from '@sentry/react';
import { CircularProgress } from '@material-ui/core';
import { USER_SESSION_TOKEN } from './constants/User';
import { sessionTokenExists } from './utils/SessionTokenExists';
import Api from './utils/api';
import { ErrorPage } from './pages/ErrorPage/ErrorPage';
import { ErrorTypes } from './constants/ErrorType';
import { randomAvatar } from './withComponents/AvatarSelect/options';
import { makeStyles } from '@material-ui/core/styles';
import JoinRoom from './withComponents/JoinRoom/JoinRoom';
import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';
import { Room } from './features/room/Room';
import { ErrorBoundary } from './withComponents/ErrorBoundary/ErrorBoundary';
import { WithModal } from './withComponents/WithModal/WithModal';
import useRoomState from './hooks/useRoomState/useRoomState';
import { Provider } from 'react-redux';
import store from './state/store';
import { VideoProvider } from './components/VideoProvider';
import { ConnectOptions } from 'twilio-video';
import { useAppState } from './state';
import { CoordinatedDispatchProvider, useCoordinatedDispatch } from './features/room/CoordinatedDispatchProvider';
import { actions } from './features/room/roomSlice';
import { MediaDeviceSynchronizer } from './features/preferences/MediaDeviceSynchronizer';
import { ErrorInfo } from './types/api';

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
  maxAudioBitrate: 12000,
  networkQuality: { local: 1, remote: 1 },
  preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
};

interface IAppProps {
  roomName: string;
}

const RoomFallback = () => {
  return (
    <WithModal isOpen={true}>
      <h1 className="u-fontH1">Well, this is awkward...</h1>
      <p className="u-fontP1">
        An unexpected error has occurred. Please try refreshing the page and rejoining the room.
      </p>
    </WithModal>
  );
};

const useStyles = makeStyles((theme) => ({
  main: {
    height: '100%',
    position: 'relative',
    color: theme.palette.common.black,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  roomContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}));

const InnerApp: FC<IAppProps> = (props) => {
  const { roomName } = props;
  const roomState = useRoomState();
  const { setError } = useAppState();
  const { connect } = useVideoContext();
  const [isLoading, setIsLoading] = useState(sessionTokenExists(localStorage.getItem(USER_SESSION_TOKEN)));
  const [errorPageInfo, setErroPageInfo] = useState<ErrorInfo | null>(null);
  const coordinatedDispatch = useCoordinatedDispatch();
  const classes = useStyles();

  useEffect(() => {
    // on page load check to see if a user has a token,
    // if they do not we will render out the the old login screen
    // this will be replaced once we move over to user / rethink anon-users
    const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);
    if (sessionTokenExists(sessionToken)) {
      // we have a session token
      // pop the loading spinner
      setIsLoading(true);
      // atttempt to get a twilio token from the back end
      Api.loggedInEnterRoom(sessionToken, roomName)
        .then((result: any) => {
          if (result.success) {
            // get the token
            const token = result.token;
            // connect using the token
            connect(token)
              .then((room) => {
                if (!room) {
                  throw new Error('Failed to join room');
                }
                // we have connected, show the room
                setIsLoading(false);
                coordinatedDispatch(
                  actions.addPerson({
                    position: { x: Math.random() * 200, y: Math.random() * 200 },
                    person: {
                      id: room?.localParticipant.sid,
                      kind: 'person',
                      // TODO: set a random avatar for right now, we will replace this with a user pref driven version later
                      avatar: randomAvatar().name,
                      emoji: null,
                      isSpeaking: false,
                      viewingScreenSid: null,
                    },
                  })
                );
              })
              .catch((e: any) => {
                setIsLoading(false);
                // if something fails here, we should fall back to just using the default join room for now
                Sentry.captureMessage(`cannot connect room ${roomName}`, Sentry.Severity.Warning);
              });
          } else {
            // TODO: we will have to fine tune this error messaging once we get back better
            // error codes from the back end, for now we just show the room doesnt exist page
            setErroPageInfo({
              errorType: ErrorTypes.ROOM_NOT_FOUND,
            });
            setIsLoading(false);
          }
        })
        .catch((e: any) => {
          setIsLoading(false);
          Sentry.captureMessage(`Error attempting to join room ${roomName}`, Sentry.Severity.Error);
          setErroPageInfo({
            errorType: ErrorTypes.UNEXPECTED,
            error: e,
          });
        });
    }
  }, [setError, connect, roomName, coordinatedDispatch]);

  // currently twilio has a call in the useRoom hook that before the video room unloads,
  // it will disconnect the user when the `beforeunload` event is called. We will do something similar here
  // for now that once beforeunload is called we will just set our spinner to be true and thus will not see the join page
  // when the user navigates away from room.
  useEffect(() => {
    const onUnload = () => {
      setIsLoading(true);
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  return errorPageInfo ? (
    <ErrorPage type={errorPageInfo.errorType} errorMessage={errorPageInfo.error?.message} />
  ) : (
    <>
      <div className={classes.container}>
        {isLoading ? (
          <div className="u-flex u-flexJustifyCenter u-flexAlignItemsCenter  u-height100Percent">
            <CircularProgress />
          </div>
        ) : (
          <main className={classes.main}>
            {roomState === 'disconnected' ? (
              <JoinRoom roomName={roomName} />
            ) : (
              <div className="u-flexGrow1 u-width100Percent u-height100Percent">
                <ErrorBoundary fallback={() => <RoomFallback />}>
                  <Room />
                  <ReconnectingNotification />
                </ErrorBoundary>
              </div>
            )}
          </main>
        )}
      </div>
      <MediaDeviceSynchronizer />
    </>
  );
};

export default function App(props: IAppProps) {
  const { setError } = useAppState();
  return (
    <Provider store={store}>
      <VideoProvider options={connectionOptions} onError={setError}>
        <CoordinatedDispatchProvider>
          <InnerApp {...props} />
        </CoordinatedDispatchProvider>
      </VideoProvider>
    </Provider>
  );
}
