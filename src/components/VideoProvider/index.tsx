import React, { createContext, ReactNode, useCallback, useEffect } from 'react';
import { ConnectOptions, Room, LocalParticipant, RemoteParticipant } from 'twilio-video';
import AttachVisibilityHandler from './AttachVisibilityHandler/AttachVisibilityHandler';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useRoom from './useRoom/useRoom';
import { useLocalTrackPublications } from './useLocalTrackPublications/useLocalTrackPublications';
import { useAllParticipants } from './useAllParticipants/useAllParticipants';
import { logger } from '../../utils/logger';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

/*
 *  The hooks used by the VideoProvider component are different than the hooks found in the 'hooks/' directory. The hooks
 *  in the 'hooks/' directory can be used anywhere in a video application, and they can be used any number of times.
 *  the hooks in the 'VideoProvider/' directory are intended to be used by the VideoProvider component only. Using these hooks
 *  elsewhere in the application may cause problems as these hooks should not be used more than once in an application.
 */

export interface IVideoContext {
  room: Room | null;
  isConnecting: boolean;
  allParticipants: (LocalParticipant | RemoteParticipant)[];
}

export const VideoContext = createContext<IVideoContext>(null!);

interface VideoProviderProps {
  options?: ConnectOptions;
  onError: (err: Error) => void;
  children: ReactNode;
  roomName: string;
}

const TrackPublisher = () => {
  useLocalTrackPublications();
  return null;
};

export function VideoProvider({ options, children, onError = noop, roomName }: VideoProviderProps) {
  const { t } = useTranslation();

  const onErrorCallback = useCallback(
    (error: Error) => {
      logger.error(`ERROR: ${error.message}`, error);
      onError(error);
    },
    [onError]
  );

  const { room, isConnecting, connect } = useRoom(onErrorCallback, options);

  // auto-join the room using authenticated user session
  useEffect(() => {
    (async function () {
      try {
        await connect(roomName);
      } catch (err) {
        onErrorCallback(err);
      }
    })();
  }, [connect, roomName, onErrorCallback, t]);

  // Register onError and onDisconnect callback functions.
  useHandleTrackPublicationFailed(room, onError);

  const allParticipants = useAllParticipants(room);

  return (
    <VideoContext.Provider
      value={{
        room,
        isConnecting,
        allParticipants,
      }}
    >
      {children}
      {/*
        The AttachVisibilityHandler component is using the useLocalVideoToggle hook
        which must be used within the VideoContext Provider.
      */}
      <AttachVisibilityHandler />
      <TrackPublisher />
    </VideoContext.Provider>
  );
}
