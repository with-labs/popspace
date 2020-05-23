/**
 * This context provider is intended to be the "glue" between the participant meta state in the room and the UI.
 */

import React, { createContext, ReactNode, useCallback } from 'react';
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

  const updateLocation = useCallback(
    (sid: string, location: LocationTuple) => {
      dispatch(locationUpdate(sid, location));
    },
    [dispatch]
  );

  const updateEmoji = useCallback(
    (emoji: EmojiData) => {
      dispatch(emojiUpdate(localParticipant.sid, emoji));
    },
    [localParticipant, dispatch]
  );

  const updateAvatar = useCallback(
    (avatar: string) => {
      dispatch(avatarUpdate(localParticipant.sid, avatar));
    },
    [localParticipant, dispatch]
  );

  const updateActiveCamera = useCallback(
    (cameraId: string) => {
      dispatch(activeCameraUpdate(localParticipant.sid, cameraId));
    },
    [localParticipant, dispatch]
  );

  const updateActiveMic = useCallback(
    (micId: string) => {
      dispatch(activeMicUpdate(localParticipant.sid, micId));
    },
    [localParticipant, dispatch]
  );

  // Return the context.
  return (
    <ParticipantMetaContext.Provider
      value={{ participantMeta, updateLocation, updateEmoji, updateAvatar, updateActiveCamera, updateActiveMic }}
    >
      {children}
    </ParticipantMetaContext.Provider>
  );
}
