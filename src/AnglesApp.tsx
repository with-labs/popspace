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

import CircleRoom from './withComponents/CircleRoom';

import useRoomState from './hooks/useRoomState/useRoomState';
import { useRoomMetaContext } from './withHooks/useRoomMetaContext/useRoomMetaContext';
import { Background } from './withComponents/BackgroundPicker';

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
  const { properties } = useRoomMetaContext();
  const { getToken, setError } = useAppState();
  const {
    connect,
    room: { localParticipant },
  } = useVideoContext();

  const onJoinSubmitHandler = (screenName: string, passcode: string) => {
    getToken(screenName, roomName, passcode)
      .then(token => connect(token))
      .catch(err => setError(err));
  };

  const bgStyle: { [key: string]: string } = {
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  };
  if (properties.bg) {
    if (properties.bg === Background.BG_CUSTOM && properties.customBG) {
      bgStyle.backgroundImage = `url("${properties.customBG})`;
    } else if (properties.bg === Background.BG_1) {
      bgStyle.backgroundImage = `url(${process.env.PUBLIC_URL}/wallpaper1.jpg)`;
    } else if (properties.bg === Background.BG_2) {
      bgStyle.backgroundImage = `url(${process.env.PUBLIC_URL}/wallpaper2.jpg)`;
    } else if (properties.bg === Background.BG_3) {
      bgStyle.backgroundImage = `url(${process.env.PUBLIC_URL}/wallpaper3.jpg)`;
    }
  }

  return (
    <Container>
      <Main style={bgStyle}>
        <div>
          <Header
            classNames="u-positionAbsolute"
            roomName={roomName}
            participantName={localParticipant && localParticipant.identity}
          />
          {roomState === 'disconnected' ? (
            <JoinRoom roomName={roomName} onJoinSubmitHandler={onJoinSubmitHandler} />
          ) : (
            <CircleRoom />
          )}
          <ReconnectingNotification />
          <Controls />
          <Footer classNames="u-positionAbsolute" />
        </div>
      </Main>
    </Container>
  );
}
