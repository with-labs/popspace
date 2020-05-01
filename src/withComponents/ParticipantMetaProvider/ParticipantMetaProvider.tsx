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
} from './participantMetaReducer';

/**
 *
 */
export interface IParticipantMetaContext {
  participantMeta: IParticipantMetaState;
  updateLocation: (sid: string, location: LocationTuple) => void;
  updateEmoji: (sid: string, emoji: EmojiData) => void;
  updateAvatar: (sid: string, avatar: string) => void;
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

  const updateLocation = (sid: string, location: LocationTuple) => {
    dispatch(locationUpdate(sid, location));
  };

  const updateEmoji = (sid: string, emoji: EmojiData) => {
    dispatch(emojiUpdate(sid, emoji));
  };

  const updateAvatar = (sid: string, avatar: string) => {
    dispatch(avatarUpdate(sid, avatar));
  };

  // Return the context.
  return (
    <ParticipantMetaContext.Provider value={{ participantMeta, updateLocation, updateEmoji, updateAvatar }}>
      {children}
    </ParticipantMetaContext.Provider>
  );
}
