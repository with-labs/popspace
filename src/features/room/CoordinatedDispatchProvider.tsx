import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useLocalDataTrack } from '../../hooks/useLocalDataTrack/useLocalDataTrack';
import store from '../../state/store';
import { actions } from './roomSlice';

interface ICoordinatedDispatchContext {
  dispatch: (action: Action) => void;
}
export const CoordinatedDispatchContext = createContext<ICoordinatedDispatchContext>(null!);

export type Action = { type: string; payload: any };

/**
 * This provider is a proxy for Redux' dispatch which handles coordination of the dispatch
 * with remote peers - our current networking functionality relies on dispatching actions
 * about local room events to our peers so they can sync their state with us. This involves
 * queueing up actions as the user joins a new room but before they have synced the initial state,
 * as detailed below.
 */
export const CoordinatedDispatchProvider: React.FC = ({ children }) => {
  const { room } = useVideoContext();
  const { localParticipant } = room;
  const localDT = useLocalDataTrack();
  const hasReceivedPing = useRef(false);

  // This is what we will use in place of the normal `dispatch` function in the redux store. This is necessary to
  // enable us to send data track messages to the remote participants with the action that was just performed.
  const dispatch = useCallback(
    (action: Action) => {
      store.dispatch(action);

      if (action.payload.sync) {
        // Then do the remote data track message
        localDT.send(JSON.stringify(action));
      }
    },
    [localDT]
  );

  const localParticipantSid = localParticipant?.sid;
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
          // Only proceed if we have a well formed PING action targetting the local participant, and we have not yet
          // received a PING.
          if (
            !hasReceivedPing.current &&
            action.payload &&
            action.payload.state &&
            action.payload.recipient === localParticipantSid
          ) {
            hasReceivedPing.current = true;
            store.dispatch(action);
          }
        } else {
          store.dispatch(action);
        }
      } catch (err) {
        // Assume JSON parse error. Ignore.
      }
    },
    [localParticipantSid]
  );

  const disconnectHandler = useCallback(() => {
    dispatch(
      actions.removePerson({
        id: localParticipantSid,
      })
    );
  }, [dispatch, localParticipantSid]);

  useEffect(() => {
    room.on('trackMessage', dataMessageHandler);
    room.on('disconnect', disconnectHandler);
    return () => {
      room.off('trackMessage', dataMessageHandler);
      room.off('disconnect', disconnectHandler);
    };
  }, [room, dataMessageHandler, disconnectHandler]);

  // Handler to call when we see a new data track published. This is intended to start the process of syncing the local
  // state to a newly joined remote participant.
  const trackPublishedHandler = useCallback(
    (pub, pt) => {
      // Send a ping to the other remotes when you see another remote data track published. This will sync the local
      // huddles state to the newly joined remote participant.
      if (pub.kind === 'data') {
        // TODO hackfix to delay the ping for a moment while the remote client subscribes to data tracks.
        setTimeout(() => {
          // we only sync the room state.
          const { room: roomState } = store.getState();
          localDT.send(
            JSON.stringify({
              type: 'PING',
              payload: {
                state: { room: roomState },
                recipient: pt.sid,
                replyto: localParticipant.sid,
              },
            })
          );
        }, 1000);
      }
    },
    [localDT, localParticipant]
  );

  useEffect(() => {
    room.on('trackPublished', trackPublishedHandler);
    return () => {
      room.off('trackPublished', trackPublishedHandler);
    };
  });

  return <CoordinatedDispatchContext.Provider value={{ dispatch }}>{children}</CoordinatedDispatchContext.Provider>;
};

export function useCoordinatedDispatch() {
  const context = useContext(CoordinatedDispatchContext);

  if (!context) {
    throw new Error('useCoordinatedDispatch must be used inside a Room');
  }

  return context.dispatch;
}
