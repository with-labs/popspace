import React from 'react';
import clsx from 'clsx';

import { LocalParticipant, RemoteParticipant } from 'twilio-video';

import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import styles from './HuddleBubble.module.css';

import useAudioTrackBlacklist from '../../withHooks/useAudioTrackBlacklist/useAudioTrackBlacklist';
import useHuddleContext from '../../withHooks/useHuddleContext/useHuddleContext';

import ParticipantCircle from '../ParticipantCircle';

interface IHuddleBubbleProps {
  huddleId: string;
  participants: (LocalParticipant | RemoteParticipant)[];
}

export function HuddleBubble({ huddleId, participants }: IHuddleBubbleProps) {
  const {
    room: { localParticipant },
  } = useVideoContext();

  const { leaveHuddle, removeFromHuddle, dissolveHuddle } = useHuddleContext();
  const disabledAudioSids = useAudioTrackBlacklist();

  const isLocalHuddle = !!participants.find(pt => pt.sid === localParticipant.sid);

  // Px size for the participant bubbles in the huddle.
  const huddlePtBubbleSize = 240;

  // `angleOffset` is for rotate transform below that arrages participant bubbles in a circle.
  const angleOffset = 360 / participants.length;
  // `huddleRadius` is used to determine the size of the huddle element, as well in the translate transform.
  const huddleRadius = (participants.length * huddlePtBubbleSize) / (2 * Math.PI);
  // `huddleAreaSize` is derived as the diameter of the huddle + huddle participant bubble size to account for the
  // huddle participant bubbles to fit inside the huddle element.
  const huddleAreaSize = huddleRadius * 2 + huddlePtBubbleSize;

  // Iterate over the huddle participants and build up the array participant bubbles.
  const ptBubbles = participants.map((pt, idx) => {
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
        style={bubStyle}
        className={clsx(styles.huddleParticipantBubble, styles.participantBubble, { blur: !isLocalHuddle })}
        onClick={() => {
          pt.sid === localParticipant.sid ? leaveHuddle() : removeFromHuddle(huddleId, pt.sid);
        }}
      >
        <ParticipantCircle
          key={pt.sid}
          participant={pt}
          onClick={() => ({})}
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

  return huddleBubble;
}
