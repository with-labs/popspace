import React, { createContext, ReactNode, useCallback } from 'react';
import * as Sentry from '@sentry/react';
import {
  CreateLocalTrackOptions,
  ConnectOptions,
  LocalAudioTrack,
  LocalVideoTrack,
  LocalDataTrack,
  Room,
} from 'twilio-video';
import { Callback } from '../../types/twilio';
import AttachVisibilityHandler from './AttachVisibilityHandler/AttachVisibilityHandler';
import useHandleRoomDisconnectionErrors from './useHandleRoomDisconnectionErrors/useHandleRoomDisconnectionErrors';
import useHandleOnDisconnect from './useHandleOnDisconnect/useHandleOnDisconnect';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useLocalTracks from './useLocalTracks/useLocalTracks';
import useRoom from './useRoom/useRoom';

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
  connect: (token: string) => Promise<Room | null>;
  onError: (err: Error) => void;
  onDisconnect: Callback;
  getLocalVideoTrack: (newOptions?: CreateLocalTrackOptions) => Promise<LocalVideoTrack>;
  getLocalAudioTrack: (deviceId?: string) => Promise<LocalAudioTrack>;
  isAcquiringLocalTracks: boolean;
  removeLocalVideoTrack: () => void;
}

export const VideoContext = createContext<IVideoContext>(null!);

interface VideoProviderProps {
  options?: ConnectOptions;
  onError: (err: Error) => void;
  onDisconnect?: Callback;
  children: ReactNode;
}

export function VideoProvider({ options, children, onError = () => {}, onDisconnect = () => {} }: VideoProviderProps) {
  const onErrorCallback = useCallback(
    (error: Error) => {
      console.log(`ERROR: ${error.message}`, error);
      Sentry.captureException(error);
      onError(error);
    },
    [onError]
  );

  const {
    localTracks,
    getLocalVideoTrack,
    getLocalAudioTrack,
    isAcquiringLocalTracks,
    removeLocalVideoTrack,
  } = useLocalTracks(onError);
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
        getLocalAudioTrack,
        connect,
        isAcquiringLocalTracks,
        removeLocalVideoTrack,
      }}
    >
      {children}
      {/*
        The AttachVisibilityHandler component is using the useLocalVideoToggle hook
        which must be used within the VideoContext Provider.
      */}
      <AttachVisibilityHandler />
    </VideoContext.Provider>
  );
}
