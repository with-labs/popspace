import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useRoomStateContext } from '../useRoomStateContext/useRoomStateContext';
import { huddleInvite, huddleLeave, huddleDissolve } from '../../withComponents/HuddleProvider/huddleReducer';
import { v4 as uuid } from 'uuid';
import { useSelector } from 'react-redux';

export default function useHuddleContext() {
  const { dispatch } = useRoomStateContext();
  // @ts-ignore Huddles are not yet included in the store
  const huddles = useSelector((state) => state.huddles);

  // Grab the `localParticipant` of the room.
  const {
    room: { localParticipant },
  } = useVideoContext();

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
  return {
    huddles,
    leaveHuddle,
    removeFromHuddle,
    inviteToHuddle,
    dissolveHuddle,
  };
}
