import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useLocalDataTrack } from '../../withHooks/useLocalDataTrack/useLocalDataTrack';

type cbFn = (...args: any[]) => void;
type State = { [key: string]: { [key: string]: any } };

interface IRoomStateContext {
  dispatch: (action: Action) => void;
  state: State;
}
export const RoomStateContext = createContext<IRoomStateContext>(null!);

export type Action = { type: string; payload: any };

interface IRoomStateProviderProps {
  children: ReactNode;
  reducers: { [key: string]: cbFn };
}

export function RoomStateProvider({ children, reducers }: IRoomStateProviderProps) {
  const [masterState, setMasterState] = useState<State>({});

  const { room } = useVideoContext();
  const localDT = useLocalDataTrack();

  // Function to expose that will update the master state, as well as send a data track message to the remote
  // participants with the action that was just performed.
  const dispatch = useCallback(
    (action: Action) => {
      // Here, cruise through the reducers
      const newState = Object.keys(reducers).reduce((state: { [key: string]: any }, sliceKey) => {
        state[sliceKey] = reducers[sliceKey](masterState[sliceKey], action);
        return state;
      }, {});
      setMasterState(newState);

      // Then do the remote data track message
      localDT.send(JSON.stringify(action));
    },
    [reducers, setMasterState, masterState, localDT]
  );

  // Handler called on `trackMessage` events from the room. Will parse the track message as JSON and then update
  // the master state object as appropriate.
  const dataMessageHandler = useCallback(
    (rawMsg: string) => {
      try {
        const action = JSON.parse(rawMsg);

        // If we encounter a PING message targetting the local participant, then set the master state wholesale.
        if (
          action.type === 'PING' &&
          action.payload &&
          action.payload.state &&
          action.payload.recipient === room.localParticipant.sid
        ) {
          setMasterState(action.payload.state);
        } else {
          // TODO find a nicer way to do this, or at least share some code with the `dispatch` function above.
          const newState = Object.keys(reducers).reduce((state: { [key: string]: any }, sliceKey) => {
            state[sliceKey] = reducers[sliceKey](masterState[sliceKey], action);
            return state;
          }, {});
          setMasterState(newState);
        }
      } catch (err) {
        // Assume JSON parse error. Ignore.
      }
    },
    [masterState, reducers, room]
  );

  useEffect(() => {
    room.on('trackMessage', dataMessageHandler);
    return () => {
      room.off('trackMessage', dataMessageHandler);
    };
  }, [room, dataMessageHandler]);

  // Initial state population. Only do this once.
  useEffect(() => {
    const newState = Object.keys(reducers).reduce((state: { [key: string]: any }, sliceKey) => {
      state[sliceKey] = reducers[sliceKey](state[sliceKey], { type: 'INIT' });
      return state;
    }, {});
    setMasterState(newState);
  }, [reducers]);

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
                state: masterState,
                recipient: pt.sid,
              },
            })
          );
        }, 1000);
      }
    },
    [masterState, localDT]
  );

  useEffect(() => {
    room.on('trackPublished', trackPublishedHandler);
    return () => {
      room.off('trackPublished', trackPublishedHandler);
    };
  });

  return <RoomStateContext.Provider value={{ dispatch, state: masterState }}>{children}</RoomStateContext.Provider>;
}
