// copy of the initial twilio code, changed a few things and wanted to keep the
// code separate

import React, { useState, useEffect } from 'react';

import { styled } from '@material-ui/core/styles';

import JoinRoom from './withComponents/JoinRoom/JoinRoom';

import { useAppState } from './state';
import useVideoContext from './hooks/useVideoContext/useVideoContext';

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
    const sessionToken = localStorage.getItem(USER_SESSION_TOKEN);
    if (sessionTokenExists(sessionToken)) {
      Api.loggedInEnterRoom(sessionToken, roomName)
        .then((result: any) => {
          if (result.success) {
            // get the token
            const token = result.token;
            setIsJoining(true);
            connect(token)
              .then(() => {
                setIsJoining(false);
              })
              .catch((e: any) => {
                console.log('error logging in');
              });
          }
        })
        .catch((e: any) => {
          console.log('Big Error');
        });
    } else {
      // token doesnt exit for now we just display the old login screen
      // this will be replaced once we move over to user / rethink anon-users
    }
  }, []);

  const bgStyle: { [key: string]: string } = {
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: bgImage,
  };

  return (
    <Container>
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
    </Container>
  );
}
