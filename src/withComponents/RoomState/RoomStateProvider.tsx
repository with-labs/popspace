import React, { createContext, ReactNode, useCallback, useEffect } from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useLocalDataTrack } from '../../withHooks/useLocalDataTrack/useLocalDataTrack';

import { Provider } from 'react-redux';

import store from './store';
import { RoomMetaProvider } from '../RoomMetaProvider/RoomMetaProvider';
import { ParticipantMetaProvider } from '../ParticipantMetaProvider/ParticipantMetaProvider';
import { HuddleProvider } from '../HuddleProvider/HuddleProvider';
import { WidgetProvider } from '../WidgetProvider/WidgetProvider';

type cbFn = (...args: any[]) => void;

interface IRoomStateContext {
  dispatch: (action: Action) => void;
}
export const RoomStateContext = createContext<IRoomStateContext>(null!);

export type Action = { type: string; payload: any };

interface IRoomStateProviderProps {
  children: ReactNode;
}

export function RoomStateProvider({ children }: IRoomStateProviderProps) {
  const { room } = useVideoContext();
  const localDT = useLocalDataTrack();

  // This is what we will use in place of the normal `dispatch` function in the redux store. This is necessary to
  // enable us to send data track messages to the remote participants with the action that was just performed.
  const dispatch = useCallback(
    (action: Action) => {
      store.dispatch(action);

      // Then do the remote data track message
      localDT.send(JSON.stringify(action));
    },
    [localDT]
  );

  // Handler called on `trackMessage` events from the room. Will parse the track message as JSON then dispatch it
  // as an action to the redux store.
  const dataMessageHandler = useCallback(
    (rawMsg: string) => {
      try {
        const action = JSON.parse(rawMsg);

        // If we encounter a PING message targetting the local participant, then set the master state wholesale.
        // The store object will handle the store state replacement. This condition is just to gate the dispatch of
        // a PING action based on the PING's recipient value equalling the local participant's sid.
        if (action.type === 'PING') {
          if (action.payload && action.payload.state && action.payload.recipient === room.localParticipant.sid) {
            store.dispatch(action);
          }
        } else {
          store.dispatch(action);
        }
      } catch (err) {
        // Assume JSON parse error. Ignore.
      }
    },
    [room]
  );

  useEffect(() => {
    room.on('trackMessage', dataMessageHandler);
    return () => {
      room.off('trackMessage', dataMessageHandler);
    };
  }, [room, dataMessageHandler]);

  // Handler to call when we see a new data track published. This is intended to start the process of syncing the local
  // state to a newly joined remote participant.
  const trackPublishedHandler = useCallback(
    (pub, pt) => {
      // Send a ping to the other remotes when you see another remote data track published. This will sync the local
      // huddles state to the newly joined remote participant.
      if (pub.kind === 'data') {
        // TODO hackfix to delay the ping for a moment while the remote client subscribes to data tracks.
        setTimeout(() => {
          localDT.send(
            JSON.stringify({
              type: 'PING',
              payload: {
                state: store.getState(),
                recipient: pt.sid,
              },
            })
          );
        }, 1000);
      }
    },
    [localDT]
  );

  useEffect(() => {
    room.on('trackPublished', trackPublishedHandler);
    return () => {
      room.off('trackPublished', trackPublishedHandler);
    };
  });

  return (
    <Provider store={store}>
      <RoomStateContext.Provider value={{ dispatch }}>
        <RoomMetaProvider>
          <ParticipantMetaProvider>
            <HuddleProvider>
              <WidgetProvider>{children}</WidgetProvider>
            </HuddleProvider>
          </ParticipantMetaProvider>
        </RoomMetaProvider>
      </RoomStateContext.Provider>
    </Provider>
  );
}
