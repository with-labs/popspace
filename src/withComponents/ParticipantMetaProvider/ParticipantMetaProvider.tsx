/**
 * This context provider is intended to be the "glue" between the participant meta state in the room and the UI.
 */

import React, { createContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { useRoomStateContext } from '../../withHooks/useRoomStateContext/useRoomStateContext';

import {
  IParticipantMetaState,
  EmojiData,
  LocationTuple,
  locationUpdate,
  avatarUpdate,
  emojiUpdate,
  activeCameraUpdate,
  activeMicUpdate,
} from './participantMetaReducer';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

/**
 *
 */
export interface IParticipantMetaContext {
  participantMeta: IParticipantMetaState;
  updateLocation: (sid: string, location: LocationTuple) => void;
  updateEmoji: (emoji: EmojiData) => void;
  updateAvatar: (avatar: string) => void;
  updateActiveCamera: (cameraId: string) => void;
  updateActiveMic: (cameraId: string) => void;
}

export const ParticipantMetaContext = createContext<IParticipantMetaContext>(null!);

interface IParticipantMetaProviderProps {
  children: ReactNode;
}

/**
 *
 * @param props
 */
export function ParticipantMetaProvider({ children }: IParticipantMetaProviderProps) {
  // @ts-ignore
  const participantMeta = useSelector(state => state.participantMeta);
  const { dispatch } = useRoomStateContext();

  const {
    room: { localParticipant },
  } = useVideoContext();

  const updateLocation = (sid: string, location: LocationTuple) => {
    dispatch(locationUpdate(sid, location));
  };

  const updateEmoji = (emoji: EmojiData) => {
    dispatch(emojiUpdate(localParticipant.sid, emoji));
  };

  const updateAvatar = (avatar: string) => {
    dispatch(avatarUpdate(localParticipant.sid, avatar));
  };

  const updateActiveCamera = (cameraId: string) => {
    dispatch(activeCameraUpdate(localParticipant.sid, cameraId));
  };

  const updateActiveMic = (micId: string) => {
    dispatch(activeMicUpdate(localParticipant.sid, micId));
  };

  // Return the context.
  return (
    <ParticipantMetaContext.Provider
      value={{ participantMeta, updateLocation, updateEmoji, updateAvatar, updateActiveCamera, updateActiveMic }}
    >
      {children}
    </ParticipantMetaContext.Provider>
  );
}
