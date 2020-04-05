import React, { useEffect, useState, useCallback, createContext, ReactNode } from 'react';
import { v4 as uuid } from 'uuid';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import { useLocalDataTrack } from '../../withHooks/useLocalDataTrack/useLocalDataTrack';

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
type HuddlesState = { [key: string]: string };

/**
 * React context for huddles. This will expose the huddles state, as well as functions to invite/leave/remove other
 * room participants to/from huddles.
 */
export interface IHuddlesContext {
  huddles: HuddlesState;
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
 * Helper function to the make sure a given huddle has at least two participants. This function mutates the object
 * passed as the `huddles` parameter and returns the reference to the object for convenience.
 *
 * @param huddleId id of the huddle to check
 * @param huddles huddle state object
 */
function ensureHuddleMembership(huddleId: string, huddles: HuddlesState) {
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

/**
 * Huddle context provider. Serves these purposes:
 * - Maintain the state of ongoing huddles in the room.
 * - Subscribe to data track messages that may contain huddle update info from other clients.
 * - Send data track messages to remote participants when local huddle state changes.
 * - Subscribe to participant and track publish events to update huddle state.
 *
 * @param props
 */
export function HuddleProvider({ children }: IHuddleProviderProps) {
  // Grab the `room` and `localTracks` properties of the video context.
  // `room` is necessary to set up listeners for room events and to get info about the local participant.
  // `localTracks` is necessary to get a reference to data tracks used to sync huddle state across clients.
  const { room } = useVideoContext();

  // For now, assume that we always have a data track, since the `useLocalTracks` hook creates one automatically.
  const localDT = useLocalDataTrack();

  // huddles state to maintain mapping of { participantSid: huddleId }
  const [huddles, setHuddles] = useState<HuddlesState>({});

  // Handle messages here. This is where we can update the state based on room/huddle additions/removals indicated by
  // other remote participants.
  const messageHandler = useCallback(
    rawMsg => {
      try {
        // Huddle data track messages follow a Redux-like pattern of having a "type" and "payload".
        const { type, payload } = JSON.parse(rawMsg);

        switch (type) {
          // A remote participant has invited another participant to a huddle.
          case 'HUDDLE_INVITE': {
            // New huddles mapping updated with current pts in the huddle
            const newHuddles = { ...huddles };
            payload.with.forEach((pt: string) => {
              newHuddles[pt] = payload.huddleId;

              // If the invited participant was already in a huddle, make sure that their previous huddle
              // still has at least two participants.
              if (huddles[pt]) {
                ensureHuddleMembership(huddles[pt], newHuddles);
              }
            });

            // Set the huddles state
            setHuddles(newHuddles);
            break;
          }

          // A remote participant has left a huddle.
          case 'HUDDLE_LEAVE': {
            // New huddles mapping updated to remove the huddle membership of the payload's participant
            const newHuddles = { ...huddles };
            delete newHuddles[payload.sid];

            // When a huddle loses a participant, we should check to make sure that there are still at least 2 other
            // participants in that huddle.
            ensureHuddleMembership(payload.huddleId, newHuddles);

            // Set the huddles state
            setHuddles(newHuddles);
            break;
          }

          case 'HUDDLE_DISSOLVE': {
            const newHuddles = { ...huddles };
            Object.keys(huddles).forEach(sid => {
              if (huddles[sid]) {
                delete newHuddles[sid];
              }
            });

            setHuddles(newHuddles);
            break;
          }

          // When a user joins a room, they will not have immediate knowledge of any huddles already happening in the
          // room. When the other remote participants detect that a new participant has joined the room, they will send
          // a "ping" data track message containing their current huddles state. This will let the new room participant
          // know what huddles, if any, are in progress in the room and update accordingly.
          case 'HUDDLE_PING': {
            // The "ping" data track message also includes a "recipient" property that targets the participant that
            // just joined the room. This will prevent unnecessary updates for participants that already have knowledge
            // of the huddles in progress.
            if (payload.recipient === room.localParticipant.sid) {
              setHuddles(payload.huddles);
            }
            break;
          }
        }
      } catch (err) {
        // Going to assume this was a JSON parse error. Ignore
      }
    },
    [huddles, room]
  );

  // On a data track message, invoke the data track message handler to update huddle info
  useEffect(() => {
    room.on('trackMessage', messageHandler);
    return () => {
      room.off('trackMessage', messageHandler);
    };
  });

  const trackPublishedHandler = useCallback(
    (pub, participant) => {
      // NOTE: since we have moved to just rendering/not-rendering the audio publications per-user, the following
      // comment isn't really that relevant, unless we have to reinstitute the usage of `reconcileAudio`. (see
      // commented out code at the bottom of this file)
      // TODO This feels way to aggressive to be reconciling audio on every track publish, but it's the only way I
      // could get the muting synced properly when a new member joins a room with existing huddles.
      // doing this on the `trackSubscribed` event didn't work in this scenario:
      // 1. A and B join room RM
      // 2. A and B engage in a huddle
      // 3. C joins room RM
      // At this point, C has not gotten a PING from the other clients, and will send a PING out itself, because it
      // just subscribed to A and B's data tracks.
      // Therefore, it will send out an erroneous bunch of data wiping out the huddle data in A and B.
      // The `trackPublished` event works because the remotes other than the new member will see the new member's
      // tracks get published and send their huddles state to the new member.
      // When a track is published, reconcile audio again
      // reconcileAudio(room, huddles);

      // Only want to ping the remote participants if there are huddles to share.
      const hasHuddles = Object.keys(huddles).length;

      // Send a ping to the other remotes when you see another remote data track published. This will sync the local
      // huddles state to the newly joined remote participant.
      if (hasHuddles && pub.kind === 'data') {
        // TODO hackfix to delay the ping for a moment while the remote client subscribes to data tracks.
        setTimeout(() => {
          localDT.send(
            JSON.stringify({
              type: 'HUDDLE_PING',
              payload: { huddles, recipient: participant.sid, sender: room.localParticipant.sid },
            })
          );
        }, 1000);
      }
    },
    [room, huddles, localDT]
  );

  // Attach the `trackPublishedHandler` to the room's `trackPublished` event.
  useEffect(() => {
    room.on('trackPublished', trackPublishedHandler);
    return () => {
      room.off('trackPublished', trackPublishedHandler);
    };
  });

  // Handler to clean up huddles after a member of the room has left.
  const memberLeftHandler = useCallback(
    participant => {
      if (huddles[participant.sid]) {
        const newHuddles = { ...huddles };
        delete newHuddles[participant.sid];

        // Make sure the huddle still has at least 2 participants.
        ensureHuddleMembership(huddles[participant.sid], newHuddles);

        setHuddles(newHuddles);

        // No need to do any audio reconciliation or data broadcasts, twilio can clean that up.
      }
    },
    [huddles]
  );

  // Attach the `memberLeftHandler` to the room's `participantDisconnected` event.
  useEffect(() => {
    room.on('participantDisconnected', memberLeftHandler);
    return () => {
      room.off('participantDisconnected', memberLeftHandler);
    };
  });

  // Function to expose to allow a local participant to leave their current huddle
  const leaveHuddle = () => {
    // Updated huddle mapping
    const newHuddles = { ...huddles };
    delete newHuddles[room.localParticipant.sid];

    // When leaving, make sure the huddle you are leaving still has at least 2 participants.
    ensureHuddleMembership(huddles[room.localParticipant.sid], newHuddles);

    // Update huddles state.
    setHuddles(newHuddles);

    // Broadcast message to other remote participants.
    localDT.send(
      JSON.stringify({
        type: 'HUDDLE_LEAVE',
        payload: { huddleId: huddles[room.localParticipant.sid], sid: room.localParticipant.sid },
      })
    );
  };

  // Function to expose to allow removing a remote participant from a huddle
  const removeFromHuddle = (huddleId: string, remoteSid: string) => {
    // Can only remove somebody from a huddle that you are part of
    if (huddles[room.localParticipant.sid] && huddles[room.localParticipant.sid] === huddles[remoteSid]) {
      // TODO figure out if there is anybody else in huddle and update accordingly (remove self if only one in huddle)
      const newHuddles = { ...huddles };
      delete newHuddles[remoteSid];

      // When removing a participant from a huddle, make sure there are still at least 2 participants in that huddle.
      ensureHuddleMembership(huddles[remoteSid], newHuddles);

      // Update huddles state
      setHuddles(newHuddles);

      // Broadcast message to remote participants
      localDT.send(JSON.stringify({ type: 'HUDDLE_LEAVE', payload: { huddleId, sid: remoteSid } }));
    }
  };

  // NOTE: Could be changed at a later date to take a list of sids to add to a huddle pretty easily. The HUDDLE_INVITE
  // handler is already capable of handling that case
  // Function to expose to allow the local participant to invite a remote participant to a huddle
  const inviteToHuddle = (inviteeSid: string) => {
    // Can't invite yourself to a huddle. No-op if that is attempted.
    if (inviteeSid !== room.localParticipant.sid) {
      // Four cases:
      // 1. Local is in a huddle and wants to add a remote pt to that huddle
      // 2. Remote pt is in a huddle and the local wants to drop in on that huddle
      // 3. Neither local nor remote are in huddle and they are starting a new huddle
      // 4. Local pt is hopping from huddle to huddle
      const newHuddles = { ...huddles };
      let huddleId = '';
      if (huddles[room.localParticipant.sid] && !huddles[inviteeSid]) {
        huddleId = huddles[room.localParticipant.sid];
        newHuddles[inviteeSid] = huddleId;
      } else if (huddles[inviteeSid] && !huddles[room.localParticipant.sid]) {
        huddleId = huddles[inviteeSid];
        newHuddles[room.localParticipant.sid] = huddleId;
      } else if (!huddles[room.localParticipant.sid] && !huddles[inviteeSid]) {
        huddleId = uuid();
        newHuddles[room.localParticipant.sid] = huddleId;
        newHuddles[inviteeSid] = huddleId;
      } else if (huddles[room.localParticipant.sid] && huddles[inviteeSid]) {
        huddleId = huddles[inviteeSid];
        newHuddles[room.localParticipant.sid] = huddleId;

        // Since the local pt is hopping between huddles, make sure their previous huddle has 2+ pts.
        ensureHuddleMembership(huddles[room.localParticipant.sid], newHuddles);
      }

      // Presence of a huddle id means that there are things to update
      if (huddleId) {
        // Update huddles state
        setHuddles(newHuddles);

        // Broadcast message to remote participants
        localDT.send(
          JSON.stringify({
            type: 'HUDDLE_INVITE',
            payload: { huddleId, with: [room.localParticipant.sid, inviteeSid] },
          })
        );
      }
    }
  };

  const dissolveHuddle = (huddleId: string) => {
    // Can only dissolve a huddle you are part of.
    if (huddleId === huddles[room.localParticipant.sid]) {
      const newHuddles = { ...huddles };
      Object.keys(huddles).forEach(sid => {
        if (huddles[sid] === huddleId) {
          delete newHuddles[sid];
        }
      });

      // Update huddles state.
      setHuddles(newHuddles);

      // Broadcast message to remotes to tell them which huddle was dissolved.
      localDT.send(JSON.stringify({ type: 'HUDDLE_DISSOLVE', payload: huddleId }));
    }
  };

  return (
    <HuddleContext.Provider value={{ huddles, leaveHuddle, removeFromHuddle, inviteToHuddle, dissolveHuddle }}>
      {children}
    </HuddleContext.Provider>
  );
}

/**
 * NOTE: leaving this here for posterity until we can verify that just toggling rendering of Participant audio track
 * publications will actually work.
 *
 * This is possibly a litte heavy handed. This function will iterate over all the Room participants and mute/unmute
 * their audio based on what room the local participant is in or which of the remote participants are in a huddle.
 * We could maybe consider doing point updates of specific users on INVITE and REMOVE huddle events, but this will
 * do just fine for now.
 */
// function reconcileAudio(room: Room, huddles: HuddlesState) {
//   // NOTE: If things get wonky with just setting the `muted` property on the track attachment elements, may need to
//   // attach/detach: https://media.twiliocdn.com/sdk/js/video/releases/2.0.0/docs/RemoteAudioTrack.html#attach__anchor
//   // Also, setting the `muted` property came from a comment on this github issue:
//   // https://github.com/twilio/twilio-video.js/issues/228#issuecomment-349121611
//   if (room.state === 'connected') {
//     if (huddles[room.localParticipant.sid]) {
//       // I'm still in a huddle, so update to make sure I'm only listening to people in my huddle
//       Array.from(room.participants.values()).forEach(pt => {
//         // Should mute a particpant if they are not in my huddle
//         const shouldMute = huddles[pt.sid] !== huddles[room.localParticipant.sid];
//         Array.from(pt.audioTracks.values()).map(tr =>
//           tr.track?._attachments?.forEach(trackEl => (trackEl.muted = shouldMute))
//         );
//       });
//     } else {
//       // I'm not in a huddle anymore, so listen to everybody that's not in a huddle
//       Array.from(room.participants.values()).forEach(pt => {
//         // Should mute participant if they are currently in a huddle
//         const shouldMute = !!huddles[pt.sid];
//         Array.from(pt.audioTracks.values()).map(tr =>
//           tr.track?._attachments?.forEach(trackEl => (trackEl.muted = shouldMute))
//         );
//       });
//     }
//   }
// }

// NOTE: leaving this here for posterity until we can verify that just toggling rendering of Participant audio track
// publications will actually work.
// Reconcile the audio muting/unmuting when the huddles or room change.
// This allows us to merely update the huddles state everywhere else, and the audio muting/unmuting will happen automagically
// useEffect(() => {
//   reconcileAudio(room, huddles);
// }, [room, huddles]);

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
//           payload: { huddles, recipient: participant.sid, sender: room.localParticipant.sid },
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
