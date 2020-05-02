// copy of the initial twilio code, changed a few things and wanted to keep the
// code separate

import React, { useState } from 'react';

import { styled } from '@material-ui/core/styles';

import JoinRoom from './withComponents/JoinRoom/JoinRoom';
import Footer from './withComponents/Footer';

import { useAppState } from './state';
import useVideoContext from './hooks/useVideoContext/useVideoContext';

import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';

import useRoomState from './hooks/useRoomState/useRoomState';
import { useRoomMetaContext } from './withHooks/useRoomMetaContext/useRoomMetaContext';
import { Background } from './withComponents/BackgroundPicker';

import { Room } from './withComponents/Room/Room';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

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
  const { connect } = useVideoContext();

  const [initialAvatar, setInitialAvatar] = useState('');

  const onJoinSubmitHandler = (screenName: string, passcode: string, avatar: string = '') => {
    getToken(screenName, roomName, passcode)
      .then(token => {
        setInitialAvatar(avatar);
        connect(token);
      })
      .catch(err => setError(err));
  };

  const bgStyle: { [key: string]: string } = {
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  };
  if (properties.bg) {
    if (properties.bg === Background.BG_CUSTOM && properties.customBG) {
      bgStyle.backgroundImage = `url(${properties.customBG})`;
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
      <Main style={bgStyle} className="u-flex u-flexCol u-flexJustifyCenter u-flexAlignItemsCenter">
        {roomState === 'disconnected' ? (
          <JoinRoom roomName={roomName} onJoinSubmitHandler={onJoinSubmitHandler} />
        ) : (
          <DndProvider backend={Backend}>
            <div className="u-flexGrow1 u-width100Percent u-height100Percent">
              <Room initialAvatar={initialAvatar} />
              <ReconnectingNotification />
            </div>
          </DndProvider>
        )}
        <Footer classNames="u-positionAbsolute" />
      </Main>
    </Container>
  );
}
