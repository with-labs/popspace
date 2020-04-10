import { Action } from '../RoomState/RoomStateProvider';

/**
 * Type to define the huddle state maintained in the huddle context by the HuddleProvider.
 *
 * The huddle state is a simple object mapping strings to single strings. Every key of the object is a participant
 * sid. Every value in the object is a huddle id. This results in mapping { <participantSid>: <huddleId> }. This is
 * relevant for several reasons:
 * 1. Quick lookup to be able to tell if a given user is currently occupied in a huddle.
 * 2. We can enforce that a single user is only allowed to be in one huddle at a time.
 * 3. Using a simple object precludes us from having to do complex array manipulation. The alternative was to maintain
 *    a mapping of { <huddleId>: [<participantSid>, <participantSid>] }, which would make determining which huddle a
 *    given participant is in somewhat difficult. The object way of doing things loses some of the semantic nature
 *    of the alternative data structure, but won out for simplicity reasons.
 */
export interface IHuddleState {
  [key: string]: string;
}

enum Actions {
  HuddleInvite = 'HUDDLE_INVITE',
  HuddleLeave = 'HUDDLE_LEAVE',
  HuddleDissolve = 'HUDDLE_DISSOLVE',
}

/**
 * Helper function to the make sure a given huddle has at least two participants. This function mutates the object
 * passed as the `huddles` parameter and returns the reference to the object for convenience.
 *
 * @param huddleId id of the huddle to check
 * @param huddles huddle state object
 */
function ensureHuddleMembership(huddleId: string, huddles: IHuddleState) {
  // Find the members of the specified huddle
  const huddleMembers = Object.keys(huddles).reduce((hms: string[], member) => {
    if (huddles[member] === huddleId) {
      hms.push(member);
    }
    return hms;
  }, []);

  // If not 2 or more people in the huddle, delete them all from the huddle mapping
  if (huddleMembers.length < 2) {
    huddleMembers.forEach(member => {
      delete huddles[member];
    });
  }

  return huddles;
}

export default function reducer(state: IHuddleState = {}, action: Action) {
  const { type, payload } = action;

  switch (type) {
    // A remote participant has invited another participant to a huddle.
    case Actions.HuddleInvite: {
      // New huddles mapping updated with current pts in the huddle
      const newHuddles = { ...state };
      payload.with.forEach((pt: string) => {
        newHuddles[pt] = payload.huddleId;

        // If the invited participant was already in a huddle, make sure that their previous huddle
        // still has at least two participants.
        if (state[pt]) {
          ensureHuddleMembership(state[pt], newHuddles);
        }
      });

      return newHuddles;
    }

    // A remote participant has left a huddle.
    case Actions.HuddleLeave: {
      // New huddles mapping updated to remove the huddle membership of the payload's participant
      const newHuddles = { ...state };
      delete newHuddles[payload.sid];

      // When a huddle loses a participant, we should check to make sure that there are still at least 2 other
      // participants in that huddle.
      ensureHuddleMembership(payload.huddleId, newHuddles);

      return newHuddles;
    }

    // Destroy an entire huddle.
    case Actions.HuddleDissolve: {
      const newHuddles = { ...state };
      Object.keys(state).forEach(sid => {
        if (state[sid] === payload) {
          delete newHuddles[sid];
        }
      });

      return newHuddles;
    }
  }

  return state;
}

export const huddleInvite = (huddleId: string, invitees: string[]) => ({
  type: Actions.HuddleInvite,
  payload: { huddleId, with: invitees },
});

export const huddleLeave = (huddleId: string, sid: string) => ({
  type: Actions.HuddleLeave,
  payload: {
    huddleId,
    sid,
  },
});

export const huddleDissolve = (huddleId: string) => ({
  type: Actions.HuddleDissolve,
  payload: huddleId,
});
