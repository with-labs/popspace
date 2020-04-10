/**
 * This context provider is intended to be the "glue" between the huddles state in the room and the UI. It exposes the
 * huddles state, as well as the action creators that will precipitate updates to the huddles state.
 */

import React, { createContext, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import { useRoomStateContext } from '../../withHooks/useRoomStateContext/useRoomStateContext';

import { IHuddleState, huddleInvite, huddleLeave, huddleDissolve } from './huddleReducer';

/**
 * React context for huddles. This will expose the huddles state, as well as functions to invite/leave/remove other
 * room participants to/from huddles.
 */
export interface IHuddlesContext {
  huddles: IHuddleState;
  leaveHuddle: () => void;
  removeFromHuddle: (huddleId: string, remoteSid: string) => void;
  inviteToHuddle: (inviteeSid: string) => void;
  dissolveHuddle: (huddleId: string) => void;
}

export const HuddleContext = createContext<IHuddlesContext>(null!);

// Props for the HuddleProvider
interface IHuddleProviderProps {
  children: ReactNode;
}

/**
 * Huddle context provider.
 *
 * @param props
 */
export function HuddleProvider({ children }: IHuddleProviderProps) {
  const { dispatch, state } = useRoomStateContext();

  // Grab the `localParticipant` of the room.
  const {
    room: { localParticipant },
  } = useVideoContext();

  const huddles = state.huddles as IHuddleState;

  // Function to expose to allow a local participant to leave their current huddle
  const leaveHuddle = () => {
    dispatch(huddleLeave(huddles[localParticipant.sid], localParticipant.sid));
  };

  // Function to expose to allow removing a remote participant from a huddle
  const removeFromHuddle = (huddleId: string, remoteSid: string) => {
    // Can only remove somebody from a huddle that you are part of
    if (huddles[localParticipant.sid] && huddles[localParticipant.sid] === huddles[remoteSid]) {
      dispatch(huddleLeave(huddleId, remoteSid));
    }
  };

  // NOTE: Could be changed at a later date to take a list of sids to add to a huddle pretty easily. The HUDDLE_INVITE
  // handler is already capable of handling that case
  // Function to expose to allow the local participant to invite a remote participant to a huddle
  const inviteToHuddle = (inviteeSid: string) => {
    // Can't invite yourself to a huddle. No-op if that is attempted.
    if (inviteeSid !== localParticipant.sid) {
      // Four cases:
      // 1. Local is in a huddle and wants to add a remote pt to that huddle
      // 2. Remote pt is in a huddle and the local wants to drop in on that huddle
      // 3. Neither local nor remote are in huddle and they are starting a new huddle
      // 4. Local pt is hopping from huddle to huddle
      let huddleId = '';
      if (huddles[localParticipant.sid] && !huddles[inviteeSid]) {
        huddleId = huddles[localParticipant.sid];
      } else if (huddles[inviteeSid] && !huddles[localParticipant.sid]) {
        huddleId = huddles[inviteeSid];
      } else if (!huddles[localParticipant.sid] && !huddles[inviteeSid]) {
        huddleId = uuid();
      } else if (huddles[localParticipant.sid] && huddles[inviteeSid]) {
        huddleId = huddles[inviteeSid];
      }

      // Presence of a huddle id means that there are things to update
      if (huddleId) {
        dispatch(huddleInvite(huddleId, [localParticipant.sid, inviteeSid]));
      }
    }
  };

  const dissolveHuddle = (huddleId: string) => {
    // Can only dissolve a huddle you are part of.
    if (huddleId === huddles[localParticipant.sid]) {
      dispatch(huddleDissolve(huddleId));
    }
  };

  return (
    <HuddleContext.Provider value={{ huddles, leaveHuddle, removeFromHuddle, inviteToHuddle, dissolveHuddle }}>
      {children}
    </HuddleContext.Provider>
  );
}

// NOTE leaving this here for near-future posterity to remind myself that this didn't work out so well. See the
// comment below referencing Batman.
// Handler to ping a new member of the room with the current huddles state
// const memberAddedHandler = useCallback(
//   participant => {
//     console.log('member added');
//     // Need to broadcast the huddle state to the new participant so they know who is in what huddles
//     // HOLY HACK-A-MOLY, BATMAN!!!
//     // Seems that there is a race condition where the newly added room participant hasn't subscribed to the existing
//     // participants' data tracks at the time the `participantAdded` event is fired. Adding a setTimeout solves that
//     // for now, but is not good. Perhaps find another event that would work better; `trackSubscribed` might be a
//     // better option.
//     setTimeout(() => {
//       localDT.send(
//         JSON.stringify({
//           type: 'HUDDLE_PING',
//           payload: { huddles, recipient: participant.sid, sender: localParticipant.sid },
//         })
//       );
//       // reconcileAudio(room, huddles);
//     }, 2000);

//     // Nothing else to do, twilio will take care of default audio state, etc...
//   },
//   [huddles, localDT, room] // maybe adding the room to the dependencies will help?
// );
// Attach the `memberAddedHandler` to the room
// useEffect(() => {
//   room.on('participantConnected', memberAddedHandler);
//   return () => {
//     room.off('participantConnected', memberAddedHandler);
//   };
// });
