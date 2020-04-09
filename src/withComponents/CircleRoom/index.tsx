import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { RemoteParticipant, LocalParticipant } from 'twilio-video';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipants from '../../hooks/useParticipants/useParticipants';

import useHuddleContext from '../../withHooks/useHuddleContext/useHuddleContext';
import useAudioTrackBlacklist from '../../withHooks/useAudioTrackBlacklist/useAudioTrackBlacklist';
import useWindowSize from '../../withHooks/useWindowSize/useWindowSize';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';

import ParticipantCircle from '../ParticipantCircle';

import styles from './CircleRoom.module.css';

const CircleRoom = () => {
  const { widgets, removeWidget } = useWidgetContext();

  const {
    room: { localParticipant },
  } = useVideoContext();

  const participantList = useParticipants();

  // List of sids to disable audio for.
  const disabledAudioSids = useAudioTrackBlacklist();

  // Need the sid: huddle map and huddle mutators.
  const { huddles: hudMap, inviteToHuddle, removeFromHuddle, leaveHuddle, dissolveHuddle } = useHuddleContext();

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
    // Make sure the local participant is first in the list of floaters.
    floaters.unshift(localParticipant);
  }

  // TODO revisit how to figure out how big a bubble should be.
  // Note that we have to add 1 to the length of the participant list to account for the local participant.
  const [width, height] = useWindowSize();
  const bubbleAreaSize = Math.min(width / 5, height);

  // The `bubbleSize` differs from `bubbleAreaSize` in that the bubbleAreaSize is the portion of the screen allocated
  // for a bubble, while bubbleSize is the size of the bubble inside that allocated space.
  const bubbleSize = bubbleAreaSize * 0.75;

  // Iterate through the huddle groups to build up the UI components for each huddle.
  const huddleBubbles: ReactNode[] = [];
  Object.keys(huddleGroups).forEach(huddleId => {
    const huddle = huddleGroups[huddleId];
    const isLocalHuddle = huddleId === localHuddle;

    // If this huddle contains the local participant, make the bubbles bigger
    const huddlePtBubbleSize = huddleId === localHuddle ? bubbleSize * 1.5 : bubbleSize;

    // `angleOffset` is for rotate transform below that arrages participant bubbles in a circle.
    const angleOffset = 360 / huddle.length;
    // `huddleRadius` is used to determine the size of the huddle element, as well in the translate transform.
    const huddleRadius = (huddle.length * huddlePtBubbleSize) / (2 * Math.PI);
    // `huddleAreaSize` is derived as the diameter of the huddle + huddle participant bubble size to account for the
    // huddle participant bubbles to fit inside the huddle element.
    const huddleAreaSize = huddleRadius * 2 + huddlePtBubbleSize;

    // Iterate over the huddle participants and build up the array participant bubbles.
    const ptBubbles = huddle.map((pt, idx) => {
      // `ptRotate` is how far to rotate the bubble inside the huddle circle. This is equal to the angle offset for
      // each child bubble + 270 degrees. Adding 270 puts the local participant closer to the left hand side of the
      // bubble.
      const ptRotate = angleOffset * idx + 270;
      const bubStyle = {
        transform: `rotate(${ptRotate}deg) translate(0, ${huddleRadius}px) rotate(-${ptRotate}deg)`,
        top: huddleRadius,
        left: huddleRadius,
        height: huddlePtBubbleSize,
        width: huddlePtBubbleSize,
      };

      return (
        <div
          key={pt.sid}
          // @ts-ignore
          style={bubStyle}
          className={clsx(styles.huddleParticipantBubble, styles.participantBubble, { blur: localHuddle !== huddleId })}
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

    // For local huddles, we will include a control to dissolve the huddle.
    const dissolveControl = isLocalHuddle ? (
      <button onClick={() => dissolveHuddle(huddleId)} className={styles.dissolveControl}></button>
    ) : null;

    // Huddle bubble.
    const huddleBubble = (
      <div
        key={huddleId}
        className={styles.huddleBubble}
        style={{
          height: huddleAreaSize,
          width: huddleAreaSize,
        }}
      >
        {ptBubbles}
        {dissolveControl}
      </div>
    );

    // Put the participant bubbles inside the huddle circle area and add the huddle bubble to the list of huddles.
    // If it's a huddle including the local participant, make it first in the list of huddles.
    if (isLocalHuddle) {
      huddleBubbles.unshift(huddleBubble);
    } else {
      huddleBubbles.push(huddleBubble);
    }
  });

  // `topPadding` is the amount of padding to add to the top of a participant bubble. Participant bubbles on odd
  // indices are rendered with top padding to reduce the table/grid-iness of the participant bubbles.
  const topPadding = bubbleAreaSize - bubbleSize;
  // Iterate through the floaters to build up a list of participant bubbles to render below the huddles.
  const floaterBubbles = floaters.map((pt, idx) => {
    // If local participant, we want to make the bubble a little bigger.
    const isLocal = pt.sid === localParticipant.sid;
    const adjustedBubbleSize = isLocal ? bubbleSize * 1.25 : bubbleSize;
    const adjustedBubbleAreaSize = isLocal ? adjustedBubbleSize * 1.15 : bubbleAreaSize;
    return (
      <div
        key={pt.sid}
        style={{
          height: adjustedBubbleAreaSize,
          width: adjustedBubbleAreaSize - topPadding / 2,
          // Tried to get fancy with it, but there just wasn't enough variation in bubble placement.
          // paddingTop: Math.pow(Math.random(), floaters.length) * topPadding,
          paddingTop: idx % 2 !== 0 && participantList.length > 0 ? topPadding : 0,
        }}
      >
        <div
          className={clsx(styles.participantBubble, { blur: localHuddle })}
          style={{
            height: adjustedBubbleSize,
            width: adjustedBubbleSize,
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

  const widgetBubbles = Object.keys(widgets).map(widgetId => {
    const widget = widgets[widgetId];

    // Approximation of size for the "remove" control on a widget bubble. Should probably be a fixed size, but
    // making it proportional to the size of the bubble ensured that it would intersect the bubble a little.
    const removeSize = bubbleSize / Math.sqrt(2) / 2;

    return (
      <div key={widgetId} className={styles.widget} style={{ height: bubbleSize, width: bubbleSize }}>
        <a href={widget.hyperlink} className={styles.widgetLink} target="_blank" rel="noopener noreferrer">
          <div
            className={clsx(styles.widgetBubble, 'u-flex u-flexAlignCenter u-flexJustifyCenter')}
            style={{ height: bubbleSize, width: bubbleSize }}
          >
            {widget.hyperlink}
          </div>
        </a>
        <div
          onClick={() => removeWidget(widgetId)}
          className={clsx(styles.widgetRemove, 'u-flex u-flexAlignCenter u-flexJustifyCenter')}
          style={{
            width: removeSize,
            height: removeSize,
          }}
        >
          <div>&times;</div>
        </div>
      </div>
    );
  });

  return (
    <div
      className="u-flex u-flexWrap u-flexJustifyCenter"
      style={{ marginTop: '100px', maxWidth: '100vw', maxHeight: '100vh' }}
    >
      <div className="u-flex u-flexWrap u-flexJustifyAround">{huddleBubbles}</div>
      <div className="u-flex u-flexWrap u-flexJustifyAround">{floaterBubbles}</div>
      <div className="u-flex u-flexWrap u-flexJustifyAround">{widgetBubbles}</div>
    </div>
  );
};

export default CircleRoom;
