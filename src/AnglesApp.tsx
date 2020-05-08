// copy of the initial twilio code, changed a few things and wanted to keep the
// code separate

import React, { useState } from 'react';

import { styled } from '@material-ui/core/styles';

import JoinRoom from './withComponents/JoinRoom/JoinRoom';

import { useAppState } from './state';
import useVideoContext from './hooks/useVideoContext/useVideoContext';

import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';

import useRoomState from './hooks/useRoomState/useRoomState';
import { useRoomMetaContext } from './withHooks/useRoomMetaContext/useRoomMetaContext';
import { useRoomMetaContextBackground } from './withHooks/useRoomMetaContextBackground/useRoomMetaContextBackground';

import { Room } from './withComponents/Room/Room';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

import { AccessoriesTray } from './withComponents/AccessoriesTray/AccessoriesTray';

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
  const bgImage = useRoomMetaContextBackground(properties);
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
    backgroundImage: bgImage,
  };

  return (
    <Container>
      <Main
        style={bgStyle}
        className="u-flex u-flexCol u-flexJustifyCenter u-flexAlignItemsCenter u-overflowHidden u-positionRelative"
      >
        {roomState === 'disconnected' ? (
          <JoinRoom roomName={roomName} onJoinSubmitHandler={onJoinSubmitHandler} />
        ) : (
          <DndProvider backend={Backend}>
            <div className="u-flexGrow1 u-width100Percent u-height100Percent">
              <Room initialAvatar={initialAvatar} />
              <ReconnectingNotification />
              <AccessoriesTray />
            </div>
          </DndProvider>
        )}
      </Main>
    </Container>
  );
}
