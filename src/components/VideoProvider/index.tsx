import React, { createContext, ReactNode, useCallback, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { ConnectOptions, Room, LocalParticipant, RemoteParticipant } from 'twilio-video';
import { Callback } from '../../types/twilio';
import AttachVisibilityHandler from './AttachVisibilityHandler/AttachVisibilityHandler';
import useHandleRoomDisconnectionErrors from './useHandleRoomDisconnectionErrors/useHandleRoomDisconnectionErrors';
import useHandleOnDisconnect from './useHandleOnDisconnect/useHandleOnDisconnect';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useRoom from './useRoom/useRoom';
import { useLocalTrackPublications } from './useLocalTrackPublications/useLocalTrackPublications';
import { useAllParticipants } from './useAllParticipants/useAllParticipants';

/*
 *  The hooks used by the VideoProvider component are different than the hooks found in the 'hooks/' directory. The hooks
 *  in the 'hooks/' directory can be used anywhere in a video application, and they can be used any number of times.
 *  the hooks in the 'VideoProvider/' directory are intended to be used by the VideoProvider component only. Using these hooks
 *  elsewhere in the application may cause problems as these hooks should not be used more than once in an application.
 */

export interface IVideoContext {
  room: Room | null;
  isConnecting: boolean;
  connect: (token: string) => Promise<Room | null>;
  onError: (err: Error) => void;
  onDisconnect: Callback;
  allParticipants: (LocalParticipant | RemoteParticipant)[];
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

  const { room, isConnecting, connect } = useRoom(onErrorCallback, options);
  useLocalTrackPublications(room);

  // Register onError and onDisconnect callback functions.
  useHandleRoomDisconnectionErrors(room, onError);
  useHandleTrackPublicationFailed(room, onError);
  useHandleOnDisconnect(room, onDisconnect);
  const allParticipants = useAllParticipants(room);

  return (
    <VideoContext.Provider
      value={{
        room,
        isConnecting,
        onError: onErrorCallback,
        onDisconnect,
        connect,
        allParticipants,
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
