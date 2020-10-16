import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useLocalDataTrack } from '../../withHooks/useLocalDataTrack/useLocalDataTrack';
import * as Sentry from '@sentry/react';
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
 *
 * FIXME: this functionality works, but it's fragile to tampering and opinionated about the
 * use of the Redux store. Clients will also get out of sync if any messages happen to be
 * lost somehow, although that is unlikely and probably mitigated by PING. Nevertheless,
 * a more stable way to do this might just be to not even allow the user to interact
 * with the room (or visibly enter it) until we have ensured that either they are
 * the first person in, or that they have already received a ping - rather than
 * relying on the queueing mechanism which necessitates this wrapper.
 */
export const CoordinatedDispatchProvider: React.FC = ({ children }) => {
  const { room } = useVideoContext();
  const { localParticipant } = room;
  const localDT = useLocalDataTrack();

  /**
   * Enter interesting logic for action queueing.
   *
   * The store syncing that occurs happens in this order:
   * 1. The first participant (A) enters the room and initializes their local state.
   * 2. The second participant (B) enters the room and initializes their local state.
   * 3. A detects that B has entered the room, and sends a PING action to B to sync B's local state to A's local state.
   * 4. B receives the PING from A and replaces it's local store with A's local store.
   *
   * This worked relatively well until the introduction of avatars. In the above scenario for store syncing,
   * participant B would dispatch an action to it's local state between steps 2 and 3 to update their avatar. This
   * is fine, except once B receives the PING it will replace it's local state with A's, which does not contain B's
   * avatar data.
   *
   * To rectify this, we can add B's actions to a queue and re-dispatch them once B receives the PING from A. This
   * will effectively update A's local state to reflect what has transpired in B's local state before B received the
   * PING.
   *
   * The tricky part is that we do not want to re-dispatch all of the actions that have happen in B prior to the PING.
   * Due to the way we are setting backgrounds and update room locations, things would get funky for A. Imagine this:
   * 1. A enters the room and sets a background.
   * 2. B enters the room, but keeps the default background.
   * 3. A PINGs B
   * 4. B replaces it's local state with A's local state.
   * 5. B re-dispatches its pre-PING actions, including the action to set the default background.
   * 6. A receives B's pre-PING actions, including the default background setting, and the background A set in the room
   *    gets overwritten.
   *
   * The same would happen for bubble location updates. A enters and sets location. B enters and sets location for
   * itself and A. The re-dispatch of B settings locations would overwrite A's local state location.
   *
   * To get around this, we should only queue actions directly related to a participant's properties. This would
   * things like setting their personal location, avatar, and/or emoji.
   *
   * And now for the world's worst logical word problem:
   * 1. Has the room loaded? We need the room data from Twilio to make an informed decision on who is in the room.
   * 2. Am I the first person in the room? The first person in the room does not need to queue any actions.
   * 3. Have I received a PING? If I'm not the first in the room and I haven't been PINGed, I need to queue actions.
   *
   * In summary: if you are not the first person in the room and you haven't received a PING, you should queue actions.
   *
   * Looking at the `dispatch` callback below, it can be seen that actions are only queued if the above conditions are
   * met and the action is a participant meta action that targets the local participant (type is a pt meta and
   * payload.sid === localParticipant.sid). This satisfies the point above that only actions directly related to the
   * local participant's meta should be queued.
   *
   * In the data track handler where PING actions are processed, if the participant has queued actions, they are
   * re-dispatched to tell the other participants in the room about the local participant's meta.
   */
  const hasReceivedPing = useRef(false);

  // This is what we will use in place of the normal `dispatch` function in the redux store. This is necessary to
  // enable us to send data track messages to the remote participants with the action that was just performed.
  const dispatch = useCallback(
    (action: Action) => {
      store.dispatch(action);

      // If this action is a "local" action, do not send it to the remote participants.
      // @ts-ignore
      if (!(action.meta && action.local)) {
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
          const state = store.getState();
          localDT.send(
            JSON.stringify({
              type: 'PING',
              payload: {
                state,
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
