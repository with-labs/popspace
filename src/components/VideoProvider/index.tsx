/**
 * #ANGLES_EDIT
 *
 * Add HuddleProvider inside the VideoContext.
 * Add WidgetProvider inside the VideoContext.
 * Add RoomStateProvider.
 * Add ParticipantMetaProvider.
 * `localTracks` context property can now include LocalDataTracks.
 */

import React, { createContext, ReactNode } from 'react';
import { ConnectOptions, Room, TwilioError, LocalAudioTrack, LocalVideoTrack, LocalDataTrack } from 'twilio-video';
import { Callback, ErrorCallback } from '../../types';
import { SelectedParticipantProvider } from './useSelectedParticipant/useSelectedParticipant';

import useHandleRoomDisconnectionErrors from './useHandleRoomDisconnectionErrors/useHandleRoomDisconnectionErrors';
import useHandleOnDisconnect from './useHandleOnDisconnect/useHandleOnDisconnect';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useLocalTracks from './useLocalTracks/useLocalTracks';
import useRoom from './useRoom/useRoom';

import { RoomStateProvider } from '../../withComponents/RoomState/RoomStateProvider';
import { HuddleProvider } from '../../withComponents/HuddleProvider/HuddleProvider';
import { WidgetProvider } from '../../withComponents/WidgetProvider/WidgetProvider';
import { RoomMetaProvider } from '../../withComponents/RoomMetaProvider/RoomMetaProvider';
import { ParticipantMetaProvider } from '../../withComponents/ParticipantMetaProvider/ParticipantMetaProvider';
import huddles from '../../withComponents/HuddleProvider/huddleReducer';
import widgets from '../../withComponents/WidgetProvider/widgetReducer';
import properties from '../../withComponents/RoomMetaProvider/roomMetaReducer';
import participantMeta from '../../withComponents/ParticipantMetaProvider/participantMetaReducer';

/*
 *  The hooks used by the VideoProvider component are different than the hooks found in the 'hooks/' directory. The hooks
 *  in the 'hooks/' directory can be used anywhere in a video application, and they can be used any number of times.
 *  the hooks in the 'VideoProvider/' directory are intended to be used by the VideoProvider component only. Using these hooks
 *  elsewhere in the application may cause problems as these hooks should not be used more than once in an application.
 */

export interface IVideoContext {
  room: Room;
  localTracks: (LocalAudioTrack | LocalVideoTrack | LocalDataTrack)[];
  isConnecting: boolean;
  connect: (token: string) => Promise<void>;
  onError: ErrorCallback;
  onDisconnect: Callback;
  getLocalVideoTrack: () => Promise<LocalVideoTrack>;
}

export const VideoContext = createContext<IVideoContext>(null!);

interface VideoProviderProps {
  options?: ConnectOptions;
  onError: ErrorCallback;
  onDisconnect?: Callback;
  children: ReactNode;
}

export function VideoProvider({ options, children, onError = () => {}, onDisconnect = () => {} }: VideoProviderProps) {
  const onErrorCallback = (error: TwilioError) => {
    console.log(`ERROR: ${error.message}`, error);
    onError(error);
  };

  const { localTracks, getLocalVideoTrack } = useLocalTracks();
  const { room, isConnecting, connect } = useRoom(localTracks, onErrorCallback, options);

  // Register onError and onDisconnect callback functions.
  useHandleRoomDisconnectionErrors(room, onError);
  useHandleTrackPublicationFailed(room, onError);
  useHandleOnDisconnect(room, onDisconnect);

  return (
    <VideoContext.Provider
      value={{
        room,
        localTracks,
        isConnecting,
        onError: onErrorCallback,
        onDisconnect,
        getLocalVideoTrack,
        connect,
      }}
    >
      <RoomStateProvider reducers={{ huddles, widgets, properties, participantMeta }}>
        <RoomMetaProvider>
          <ParticipantMetaProvider>
            <HuddleProvider>
              <WidgetProvider>
                <SelectedParticipantProvider room={room}>{children}</SelectedParticipantProvider>
              </WidgetProvider>
            </HuddleProvider>
          </ParticipantMetaProvider>
        </RoomMetaProvider>
      </RoomStateProvider>
    </VideoContext.Provider>
  );
}
