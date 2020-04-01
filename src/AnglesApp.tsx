// copy of the initial twilio code, changed a few things and wanted to keep the
// code separate

import React from 'react';

import { styled } from '@material-ui/core/styles';

import JoinRoom from './withComponents/JoinRoom';
import Header from './withComponents/Header';
import Footer from './withComponents/Footer';

import { useAppState } from './state';
import useVideoContext from './hooks/useVideoContext/useVideoContext';

import Controls from './components/Controls/Controls';
import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';
import Room from './components/Room/Room';

import useRoomState from './hooks/useRoomState/useRoomState';

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

export default function AnglesApp(props: AnglesAppProps) {
  const { roomName } = props;
  const roomState = useRoomState();
  const { user, getToken, isFetching } = useAppState();
  const { isConnecting, connect } = useVideoContext();

  const onJoinSubmitHandler = (screenName: string, passcode: string) => {
    getToken(screenName, roomName, passcode).then(token => connect(token));
  };

  return (
    <Container>
      <Main>
        <Header classNames="u-positionAbsolute" roomName={roomName} />
        {roomState === 'disconnected' ? (
          <JoinRoom roomName={roomName} onJoinSubmitHandler={onJoinSubmitHandler} />
        ) : (
          <Room />
        )}
        <ReconnectingNotification />
        <Controls />
        <Footer classNames="u-positionAbsolute" />
      </Main>
    </Container>
  );
}
