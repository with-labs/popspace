/**
 * This context provider is intended to be the "glue" between the widgets state in the room and the UI. It exposes the
 * room meta state, as well as the action creators that will precipitate updates to the app.
 */

import React, { createContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { useRoomStateContext } from '../../withHooks/useRoomStateContext/useRoomStateContext';

import { IRoomMetaState, propertySet, propertiesSet, propertyUnset } from './roomMetaReducer';

/**
 * React context structure for the room meta context. This will expose the properties, as well as functions to
 * set and unset room meta properties.
 */
export interface IRoomMetaContext {
  properties: IRoomMetaState;
  setProperty: (key: string, value: string) => void;
  setProperties: (props: { [key: string]: string }) => void;
  unsetProperty: (key: string) => void;
}

// The React context for room meta.
export const RoomMetaContext = createContext<IRoomMetaContext>(null!);

// RoomStateProvider props. Only needs children.
interface IRoomMetaProviderProps {
  children: ReactNode;
}

/**
 * Room meta context provider.
 *
 * @param props
 */
export function RoomMetaProvider({ children }: IRoomMetaProviderProps) {
  // @ts-ignore
  const properties = useSelector(state => state.properties);
  const { dispatch } = useRoomStateContext();

  // Mutator to set a property
  const setProperty = (key: string, value: string) => {
    dispatch(propertySet(key, value));
  };

  const setProperties = (props: { [key: string]: string }) => {
    dispatch(propertiesSet(props));
  };

  // Mutator to unset a property
  const unsetProperty = (key: string) => {
    dispatch(propertyUnset(key));
  };

  // Return the context.
  return (
    <RoomMetaContext.Provider value={{ properties, setProperty, setProperties, unsetProperty }}>
      {children}
    </RoomMetaContext.Provider>
  );
}
