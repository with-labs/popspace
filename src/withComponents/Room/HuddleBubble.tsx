import React, { useEffect } from 'react';
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

  const { leaveHuddle, removeFromHuddle, dissolveHuddle, inviteToHuddle } = useHuddleContext();
  const disabledAudioSids = useAudioTrackBlacklist();

  const isLocalHuddle = !!participants.find(pt => pt.sid === localParticipant.sid);

  // Px size for the participant bubbles in the huddle.
  const huddlePtBubbleSize = 240;

  // `angleOffset` is for rotate transform below that arrages participant bubbles in a circle.
  const angleOffset = 360 / participants.length;
  // `huddleRadius` is used to determine the size of the huddle element, as well in the translate transform.
  let huddleRadius = (participants.length * huddlePtBubbleSize) / (2 * Math.PI);
  // Completely arbitrary thing here, but increase the huddle radius for small huddles to prevent major overlap amongst participant bubbles.
  if (participants.length < 10) huddleRadius += huddlePtBubbleSize / participants.length;
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

    const ptClickHandler = () => {
      if (isLocalHuddle) {
        if (pt.sid === localParticipant.sid) {
          leaveHuddle();
        } else {
          removeFromHuddle(huddleId, pt.sid);
        }
      } else {
        inviteToHuddle(pt.sid);
      }
    };

    return (
      <div
        key={pt.sid}
        style={bubStyle}
        className={clsx(styles.huddleParticipantBubble, styles.participantBubble, { 'u-blur': !isLocalHuddle })}
        onClick={ptClickHandler}
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

  // play the huddle ping for a user when they are added into a huddle
  useEffect(() => {
    if (isLocalHuddle) {
      // get the audio ping to play when the local user is brought into a huddle
      const huddlePingAudio = new Audio(`${process.env.PUBLIC_URL}/audio/huddlePing.mp3`);
      huddlePingAudio.play();
    }
  }, [isLocalHuddle]);

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
      <div
        className={clsx(styles.backdrop, 'u-round')}
        style={{ height: huddleRadius * 1.5, width: huddleRadius * 1.5 }}
      ></div>
      {dissolveControl}
      {ptBubbles}
    </div>
  );

  return huddleBubble;
}
