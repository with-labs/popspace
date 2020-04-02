import React from 'react';
import clsx from 'clsx';
import { RemoteParticipant, LocalParticipant } from 'twilio-video';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useHuddleContext from '../../withHooks/useHuddleContext/useHuddleContext';

import useParticipants from '../../hooks/useParticipants/useParticipants';
import useAudioTrackBlacklist from '../../withHooks/useAudioTrackBlacklist/useAudioTrackBlacklist';

import ParticipantCircle from '../ParticipantCircle';

import useWindowSize from '../../withHooks/useWindowSize/useWindowSize';

const CircleRoom = () => {
  const {
    room: { localParticipant },
  } = useVideoContext();

  const participantList = useParticipants();

  // List of sids to disable audio for.
  const disabledAudioSids = useAudioTrackBlacklist();

  // Need the sid: huddle map and huddle mutators.
  const { huddles: hudMap, inviteToHuddle, removeFromHuddle, leaveHuddle } = useHuddleContext();

  // Get the local participant's huddle, if they are in one.
  const localHuddle = hudMap[localParticipant.sid];

  // TODO could make a custom hook for this, or expose it in the huddle context.
  // `huddleGroups` will be a mapping of { <huddleId>: [...Participants] }.
  const huddleGroups: { [key: string]: (LocalParticipant | RemoteParticipant)[] } = {};
  // `floaters` will be an array of Participants that are not currently in a huddle.
  const floaters: (LocalParticipant | RemoteParticipant)[] = [];

  // To get a full view of who is/isn't in a huddle iterate over the participants and build up the `huddleGroups` and
  // `floaters`.
  participantList.forEach(pt => {
    if (hudMap[pt.sid]) {
      if (huddleGroups[hudMap[pt.sid]]) {
        huddleGroups[hudMap[pt.sid]].push(pt);
      } else {
        huddleGroups[hudMap[pt.sid]] = [pt];
      }
    } else {
      floaters.push(pt);
    }
  });

  // Because the local participant is not included in the list of participants, add them to their huddle or as a
  // floater, as appropriate.
  if (localHuddle && huddleGroups[localHuddle]) {
    huddleGroups[localHuddle].push(localParticipant);
  } else {
    floaters.push(localParticipant);
  }

  const [width, height] = useWindowSize();

  // Note that we have to add 1 to the length of the participant list to account for the local participant.
  // This could use some work to decide how big bubbles should be. This method makes the bubbles a bit small once
  // there are more than 3 or 4 bubbles.
  const bubbleAreaSize = Math.min(width, height) / (participantList.length + 1);

  // The `bubbleSize` differs from `bubbleAreaSize` in that the bubbleAreaSize is the portion of the screen allocated
  // for a bubble, while bubbleSize is the size of the bubble inside that allocated space.
  const bubbleSize = bubbleAreaSize * 0.75;

  // Iterate through the huddle groups to build up the UI components for each huddle.
  const huddleBubbles = Object.keys(huddleGroups).map(huddleId => {
    const huddle = huddleGroups[huddleId];

    // If this huddle contains the local participant, make the bubbles bigger
    const huddlePtBubbleSize = huddleId === localHuddle ? bubbleSize * 1.25 : bubbleSize;

    // `angleOffset` is for rotate transform below that arrages participant bubbles in a circle.
    const angleOffset = 360 / huddle.length;
    // `huddleRadius` is used to determine the size of the huddle element, as well in the translate transform.
    const huddleRadius = (huddle.length * huddlePtBubbleSize) / (2 * Math.PI);
    // `huddleAreaSize` is derived as the diameter of the huddle + huddle participant bubble size to account for the
    // huddle participant bubbles to fit inside the huddle element.
    const huddleAreaSize = huddleRadius * 2 + huddlePtBubbleSize;

    // Iterate over the huddle participants and build up the array participant bubbles.
    const ptBubbles = huddle.map((pt, idx) => {
      // `ptRotate` is how far to rotate the bubble inside the huddle circle.
      const ptRotate = angleOffset * idx;
      const bubStyle = {
        transform: `rotate(${ptRotate}deg) translate(0, ${huddleRadius}px) rotate(-${ptRotate}deg)`,
        top: huddleRadius,
        left: huddleRadius,
        height: huddlePtBubbleSize,
        width: huddlePtBubbleSize,
        borderRadius: '50%',
        backgroundColor: 'blue',
        position: 'absolute',
        overflow: 'hidden',
      };

      return (
        <div
          key={pt.sid}
          // @ts-ignore
          style={bubStyle}
          className={clsx({ blur: localHuddle !== huddleId })}
          onClick={() => {
            pt.sid === localParticipant.sid ? leaveHuddle() : removeFromHuddle(huddleId, pt.sid);
          }}
        >
          <ParticipantCircle
            key={pt.sid}
            participant={pt}
            onClick={() => inviteToHuddle(pt.sid)}
            disableAudio={disabledAudioSids.includes(pt.sid)}
          />
        </div>
      );
    });

    // Put the participant bubbles inside the huddle circle area.
    return (
      <div
        key={huddleId}
        className="HuddleBubble"
        style={{
          position: 'relative',
          height: huddleAreaSize,
          width: huddleAreaSize,
          borderRadius: '50%',
          backgroundColor: 'grey',
        }}
      >
        {ptBubbles}
      </div>
    );
  });

  // `topPadding` is the amount of padding to add to the top of a participant bubble. Participant bubbles on odd
  // indices are rendered with top padding to reduce the table/grid-iness of the participant bubbles.
  const topPadding = bubbleAreaSize - bubbleSize;
  // Iterate through the floaters to build up a list of participant bubbles to render below the huddles.
  const floaterBubbles = floaters.map((pt, idx) => {
    // If local participant is not in a huddle, we want to make the bubble a little bigger.
    const adjustedBubbleSize = pt.sid === localParticipant.sid && !localHuddle ? bubbleSize * 1.25 : bubbleSize;
    return (
      <div
        key={pt.sid}
        style={{
          height: bubbleAreaSize,
          width: bubbleAreaSize,
          // Tried to get fancy with it, but there just wasn't enough variation in bubble placement.
          // paddingTop: Math.pow(Math.random(), floaters.length) * basePadding,
          paddingTop: idx % 2 === 0 && participantList.length > 0 ? topPadding : 0,
        }}
      >
        <div
          className={clsx({ blur: localHuddle })}
          style={{
            height: adjustedBubbleSize,
            width: adjustedBubbleSize,
            borderRadius: '50%',
            backgroundColor: 'blue',
            overflow: 'hidden',
          }}
        >
          <ParticipantCircle
            participant={pt}
            onClick={() => inviteToHuddle(pt.sid)}
            disableAudio={disabledAudioSids.includes(pt.sid)}
          />
        </div>
      </div>
    );
  });

  return (
    <div style={{ height: '100%', width: '100%', marginTop: '100px' }}>
      <div className="u-flex u-flexWrap">{huddleBubbles}</div>
      <div className="u-flex u-flexWrap">{floaterBubbles}</div>
    </div>
  );
};

export default CircleRoom;
