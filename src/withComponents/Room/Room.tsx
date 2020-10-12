import React, { useCallback, useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import * as Sentry from '@sentry/react';

import { useRoomParties } from '../../withHooks/useRoomParties/useRoomParties';

import ParticipantCircle from '../ParticipantCircle';
import { HuddleBubble } from './HuddleBubble';
import { SharedScreenViewer } from '../SharedScreenViewer/SharedScreenViewer';

import useAudioTrackBlacklist from '../../withHooks/useAudioTrackBlacklist/useAudioTrackBlacklist';
import useWindowSize from '../../withHooks/useWindowSize/useWindowSize';

import style from './Room.module.css';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import { useParticipantMetaContext } from '../ParticipantMetaProvider/useParticipantMetaContext';
import { LocationTuple } from '../../types';
import { useLocalVolumeDetection } from '../../withHooks/useLocalVolumeDetection/useLocalVolumeDetection';
import { motion } from 'framer-motion';

import { Widgets } from './Widgets';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { WithModal } from '../WithModal/WithModal';

import { DraggableEntity } from '../DraggableEntity/DraggableEntity';

export interface DragItem {
  type: string;
  id: string;
  top: number;
  left: number;
}

interface IRoomProps {
  initialAvatar: string;
}

const WidgetsFallback = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <WithModal isOpen={isOpen} onCloseHandler={() => setIsOpen(false)}>
      <h1 className="u-fontH1">Accessories error</h1>
      <p className="u-fontP1">
        An error occurred while setting up the room's accessories. Try refreshing the page and rejoining the room to fix
        this error.
      </p>
    </WithModal>
  );
};

export const Room: React.FC<IRoomProps> = ({ initialAvatar }) => {
  const { huddles, floaters, localHuddle } = useRoomParties();
  const disabledAudioSids = useAudioTrackBlacklist();
  const [windowWidth, windowHeight] = useWindowSize();
  const { updateLocation, participantMeta, updateAvatar } = useParticipantMetaContext();
  const dragableArea = useRef(null);

  const {
    room: { localParticipant },
  } = useVideoContext();

  useLocalVolumeDetection();

  useEffect(() => {
    if (initialAvatar) {
      updateAvatar(initialAvatar);
    } else {
      Sentry.captureMessage(`Missing avatar in Room initialization for ${localParticipant.sid}`, Sentry.Severity.Debug);
    }
  }, [initialAvatar]);

  // Fn to convert top/left px coordintates to a LocationTuple.
  const pxToLocation = useCallback(
    (left: number, top: number) => {
      return [windowWidth && left / windowWidth, windowHeight && top / windowHeight] as LocationTuple;
    },
    [windowWidth, windowHeight]
  );

  // Update the local participant's position in the participant meta map. Only do this on first render and when
  // the window dimensions change.

  //TODO: adding in a null check on the participantMeta to prevent the app from blowing up on mobile
  // seems to introduce a ghost user when joing a room on mobile
  useEffect(() => {
    if (
      !participantMeta[localParticipant.sid]?.location ||
      !(participantMeta[localParticipant.sid]?.location[0] && participantMeta[localParticipant.sid]?.location[1])
    ) {
      // Whip up some pseudo random numbers as the initial position of the bubble.
      const left = Math.random() * (windowWidth / 2);
      const top = Math.random() * (windowHeight / 2);
      updateLocation(localParticipant.sid, pxToLocation(left, top));
    }
  }, [windowWidth, windowHeight]); // Only update the local participants position if window size changes.

  return (
    <motion.div ref={dragableArea} className="u-height100Percent u-width100Percent">
      <div className="u-positionRelative u-height100Percent">
        {Object.keys(huddles).map((huddleId) => (
          <HuddleBubble huddleId={huddleId} participants={huddles[huddleId]} key={huddleId} />
        ))}
        <ErrorBoundary fallback={() => <WidgetsFallback />}>
          <Widgets dragConstraints={dragableArea} />
        </ErrorBoundary>
        {floaters.map((pt) => {
          return (
            <DraggableEntity
              position={participantMeta[pt.sid]?.location}
              onDragEnd={(location) => updateLocation(pt.sid, location)}
              dragConstraints={dragableArea}
              className={clsx('u-layerSurfaceDelta ', style.participantBubble, { 'u-blur': localHuddle })}
              key={pt.sid}
              disableDrag={pt.sid !== localParticipant.sid}
            >
              <ParticipantCircle
                participant={pt}
                onClick={() => null}
                disableAudio={disabledAudioSids.includes(pt.sid)}
              />
            </DraggableEntity>
          );
        })}
        <SharedScreenViewer />
      </div>
    </motion.div>
  );
};
