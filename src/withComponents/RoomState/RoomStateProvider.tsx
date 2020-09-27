import React, { createContext, ReactNode, useCallback, useEffect, useRef } from 'react';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useLocalDataTrack } from '../../withHooks/useLocalDataTrack/useLocalDataTrack';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';

import store from './store';
import { RoomMetaProvider } from '../RoomMetaProvider/RoomMetaProvider';
import { ParticipantMetaProvider } from '../ParticipantMetaProvider/ParticipantMetaProvider';
import { HuddleProvider } from '../HuddleProvider/HuddleProvider';
import { WidgetProvider } from '../WidgetProvider/WidgetProvider';

import { Actions as PtMetaActionTypes } from '../ParticipantMetaProvider/participantMetaReducer';
import { AVSourcesProvider } from '../AVSourcesProvider/AVSourcesProvider';

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
  const roomHasLoaded = room.participants !== undefined;
  const firstInRoom = roomHasLoaded && !room.participants.size;

  const hasReceivedPing = useRef(false);
  const shouldQueueParticipantMetaActions = useRef((!roomHasLoaded || !firstInRoom) && !hasReceivedPing.current);
  const actionQueue = useRef([]);

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

      if (shouldQueueParticipantMetaActions.current && action.type !== 'PING') {
        if (
          localParticipant &&
          // @ts-ignore
          Object.values(PtMetaActionTypes).includes(action.type) &&
          action.payload.sid === localParticipant.sid
        ) {
          // @ts-ignore
          actionQueue.current.push(action);
        }
      }
    },
    [localDT, localParticipant, shouldQueueParticipantMetaActions.current] // Only need to update this if the data track or the need to queue actions change
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
          // Only proceed if we have a well formed PING action targetting the local participant, and we have not yet
          // received a PING.
          if (
            !hasReceivedPing.current &&
            action.payload &&
            action.payload.state &&
            action.payload.recipient === localParticipant.sid
          ) {
            store.dispatch(action);

            // Re-dispatch the pre-PING actions.
            if (actionQueue.current.length) {
              hasReceivedPing.current = true;
              shouldQueueParticipantMetaActions.current = false;
              actionQueue.current.forEach((act) => {
                dispatch(act);

                // @ts-ignore This is for debugging, no need to type the act obj.
                if (act.type === PtMetaActionTypes.UpdateAvatar && !act?.payload?.avatar) {
                  Sentry.captureMessage(
                    `Missing avatar in PING action replay for ${localParticipant.sid}`,
                    Sentry.Severity.Debug
                  );
                }
              });
              // Clear out the action queue
              actionQueue.current = [];
            }
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

  return (
    <Provider store={store}>
      <RoomStateContext.Provider value={{ dispatch }}>
        <RoomMetaProvider>
          <ParticipantMetaProvider>
            <AVSourcesProvider>
              <HuddleProvider>
                <WidgetProvider>{children}</WidgetProvider>
              </HuddleProvider>
            </AVSourcesProvider>
          </ParticipantMetaProvider>
        </RoomMetaProvider>
      </RoomStateContext.Provider>
    </Provider>
  );
}
