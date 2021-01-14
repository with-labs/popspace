import React, { createContext, ReactNode, useCallback, useEffect } from 'react';
import { ConnectOptions, Room, LocalParticipant, RemoteParticipant } from 'twilio-video';
import AttachVisibilityHandler from './AttachVisibilityHandler/AttachVisibilityHandler';
import useHandleTrackPublicationFailed from './useHandleTrackPublicationFailed/useHandleTrackPublicationFailed';
import useRoom from './useRoom/useRoom';
import { useLocalTrackPublications } from './useLocalTrackPublications/useLocalTrackPublications';
import { useAllParticipants } from './useAllParticipants/useAllParticipants';
import { logger } from '../../utils/logger';
import { noop } from 'lodash';
import api from '../../utils/api';
import { ErrorCodes } from '../../constants/ErrorCodes';
import { useTranslation } from 'react-i18next';

export class JoinError extends Error {
  constructor(message: string, public errorCode: ErrorCodes) {
    super(message);
  }
}
export class FatalError extends Error {
  constructor(message: string, public errorCode: ErrorCodes) {
    super(message);
  }
}

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
        const result = await api.loggedInEnterRoom(roomName);
        if (!result.success || !result.token) {
          if (result.errorCode === ErrorCodes.UNAUTHORIZED_ROOM_ACCESS) {
            // user is logged in but doesnt have room access
            throw new JoinError(t('error.messages.noRoomAccess'), ErrorCodes.UNAUTHORIZED_ROOM_ACCESS);
          } else if (result.errorCode === ErrorCodes.UNKNOWN_ROOM) {
            // trying to join a room that does not exist
            throw new FatalError(t('error.messages.unknownRoom'), ErrorCodes.ROOM_NOT_FOUND);
          }
          if (result.errorCode === ErrorCodes.UNAUTHORIZED_USER) {
            // user is not logged in
            throw new JoinError(t('error.messages.unauthorized'), ErrorCodes.UNAUTHORIZED_USER);
          } else {
            logger.error(`Unhandled expection in useJoin`, result.errorCode, result.message);
            throw new JoinError(t('error.messages.joinRoomUnknownFailure'), ErrorCodes.JOIN_ROOM_UNKNOWN);
          }
        }
        const token = result.token;
        await connect(token);
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
