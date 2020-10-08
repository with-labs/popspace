// copy of the initial twilio code, changed a few things and wanted to keep the
// code separate

import React, { useState, useEffect } from 'react';
import { styled } from '@material-ui/core/styles';
import JoinRoom from './withComponents/JoinRoom/JoinRoom';
import { useAppState } from './state';
import useVideoContext from './hooks/useVideoContext/useVideoContext';
import * as Sentry from '@sentry/react';
import { CircularProgress } from '@material-ui/core';

import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';
import useRoomState from './hooks/useRoomState/useRoomState';
import { useRoomMetaContext } from './withHooks/useRoomMetaContext/useRoomMetaContext';
import { useRoomMetaContextBackground } from './withHooks/useRoomMetaContextBackground/useRoomMetaContextBackground';

import { Room } from './withComponents/Room/Room';

import { AccessoriesDock } from './withComponents/AccessoriesDock/AccessoriesDock';
import { ErrorBoundary } from './withComponents/ErrorBoundary/ErrorBoundary';
import { WithModal } from './withComponents/WithModal/WithModal';
import { USER_SESSION_TOKEN } from './constants/User';
import { sessionTokenExists } from './utils/SessionTokenExists';
import Api from './utils/api';
import { ErrorPage } from './pages/ErrorPage/ErrorPage';
import { ErrorTypes } from './constants/ErrorType';
import { ErrorInfo } from './types';
import { randomAvatar } from './withComponents/AvatarSelect/options';

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
});

const Main = styled('main')({
  height: '100%',
  position: 'relative',
  color: '#000',
});

type AnglesAppProps = {
  roomName: string;
};

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

export default function AnglesApp(props: AnglesAppProps) {
  const { roomName } = props;
  const roomState = useRoomState();
  const { properties } = useRoomMetaContext();
  const bgImage = useRoomMetaContextBackground(properties);
  const { getToken, setError } = useAppState();
  const { connect } = useVideoContext();
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(sessionTokenExists(localStorage.getItem(USER_SESSION_TOKEN)));
  const [errorPageInfo, setErroPageInfo] = useState<ErrorInfo>(null!);

  const [initialAvatar, setInitialAvatar] = useState('');

  const onJoinSubmitHandler = async (screenName: string, passcode: string, avatar: string = '') => {
    // check to see if we are already attempting to join a room to prevent
    // another token request is in progress
    if (!isJoining) {
      try {
        setIsJoining(true);
        const token = await getToken(screenName, roomName, passcode);
        setInitialAvatar(avatar);
        await connect(token);
      } catch (err) {
        setError(err);
      }
      // set isJoining to false after we attempt to connect
      setIsJoining(false);
    }
  };

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
            // TODO: set a random avatar for right now, we will replace this with a user pref driven version later
            setInitialAvatar(randomAvatar().name);
            // connect using the token
            connect(token)
              .then(() => {
                // we have connected, show the room
                setIsLoading(false);
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
  }, [setError, connect, roomName]);

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

  const bgStyle: { [key: string]: string } = {
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: bgImage,
  };

  return errorPageInfo ? (
    <ErrorPage type={errorPageInfo.errorType} errorMessage={errorPageInfo.error?.message} />
  ) : (
    <Container>
      {isLoading ? (
        <div className="u-flex u-flexJustifyCenter u-flexAlignItemsCenter  u-height100Percent">
          <CircularProgress />
        </div>
      ) : (
        <Main
          style={bgStyle}
          className="u-flex u-flexCol u-flexJustifyCenter u-flexAlignItemsCenter u-overflowHidden u-positionRelative"
        >
          {roomState === 'disconnected' ? (
            <JoinRoom roomName={roomName} onJoinSubmitHandler={onJoinSubmitHandler} isJoining={isJoining} />
          ) : (
            <div className="u-flexGrow1 u-width100Percent u-height100Percent">
              <ErrorBoundary fallback={() => <RoomFallback />}>
                <Room initialAvatar={initialAvatar} />
                <ReconnectingNotification />
                <AccessoriesDock />
              </ErrorBoundary>
            </div>
          )}
        </Main>
      )}
    </Container>
  );
}
