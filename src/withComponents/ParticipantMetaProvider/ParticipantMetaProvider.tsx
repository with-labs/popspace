/**
 * This context provider is intended to be the "glue" between the participant meta state in the room and the UI.
 */

import React, { createContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { useRoomStateContext } from '../../withHooks/useRoomStateContext/useRoomStateContext';

import { IParticipantMetaState, LocationTuple, locationUpdate, presenceUpdate } from './participantMetaReducer';

/**
 *
 */
export interface IParticipantMetaContext {
  participantMeta: IParticipantMetaState;
  updateLocation: (sid: string, location: LocationTuple) => void;
  updatePresence: (sid: string, presence: string) => void;
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

  const updatePresence = (sid: string, presence: string) => {
    dispatch(presenceUpdate(sid, presence));
  };

  // Return the context.
  return (
    <ParticipantMetaContext.Provider value={{ participantMeta, updateLocation, updatePresence }}>
      {children}
    </ParticipantMetaContext.Provider>
  );
}
