import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { LocalParticipant, RemoteParticipant } from 'twilio-video';

import { useDrop, XYCoord } from 'react-dnd';

import { useRoomParties } from '../../withHooks/useRoomParties/useRoomParties';

import { DraggableItem } from './DraggableItem';
import ParticipantCircle from '../ParticipantCircle';
import { HuddleBubble } from './HuddleBubble';
import { SharedScreenViewer } from '../SharedScreenViewer/SharedScreenViewer';

import useAudioTrackBlacklist from '../../withHooks/useAudioTrackBlacklist/useAudioTrackBlacklist';
import useHuddleContext from '../../withHooks/useHuddleContext/useHuddleContext';
import useWindowSize from '../../withHooks/useWindowSize/useWindowSize';

import style from './Room.module.css';
import { LinkWidget } from '../LinkWidget/LinkWidget';
import Whiteboard from '../Whiteboard/Whiteboard';
import { useWidgetContext } from '../../withHooks/useWidgetContext/useWidgetContext';
import { WidgetTypes } from '../WidgetProvider/widgetTypes';
import useParticipants from '../../hooks/useParticipants/useParticipants';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

import { useParticipantMetaContext } from '../ParticipantMetaProvider/useParticipantMetaContext';
import { LocationTuple } from '../ParticipantMetaProvider/participantMetaReducer';
import { useLocalVolumeDetection } from '../../withHooks/useLocalVolumeDetection/useLocalVolumeDetection';

export interface DragItem {
  type: string;
  id: string;
  top: number;
  left: number;
}

interface IRoomProps {
  initialAvatar: string;
}

export const Room: React.FC<IRoomProps> = ({ initialAvatar }) => {
  const { huddles, floaters, widgets, localHuddle } = useRoomParties();
  const { inviteToHuddle } = useHuddleContext();
  const { removeWidget } = useWidgetContext();
  const disabledAudioSids = useAudioTrackBlacklist();
  const [windowWidth, windowHeight] = useWindowSize();
  const remoteParticipants = useParticipants();
  const { updateLocation, participantMeta, updateAvatar } = useParticipantMetaContext();

  const {
    room: { localParticipant },
  } = useVideoContext();

  useLocalVolumeDetection();

  const widgetLinks = widgets.filter(widget => widget.type === WidgetTypes.Link);
  // safe to assume only one whiteboard ever
  const [widgetWhiteboard] = widgets.filter(widget => widget.type === WidgetTypes.Whiteboard);

  useEffect(() => {
    if (initialAvatar) {
      updateAvatar(initialAvatar);
    }
  }, [initialAvatar]);

  const [bubs, setBubs] = useState<{
    [key: string]: {
      top: number;
      left: number;
      pt: LocalParticipant | RemoteParticipant;
    };
  }>({});

  const [, drop] = useDrop({
    accept: 'BUBBLE',
    drop(item: DragItem, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
      const left = Math.round(item.left + delta.x);
      const top = Math.round(item.top + delta.y);
      moveBox(item.id, left, top);
      return undefined;
    },
  });

  // Fn to convert top/left px coordintates to a LocationTuple.
  const pxToLocation = useCallback(
    (left: number, top: number) => {
      return [windowWidth && left / windowWidth, windowHeight && top / windowHeight] as LocationTuple;
    },
    [windowWidth, windowHeight]
  );

  // Callback used by the drag/drop container to update the bubble locations object state and dispatch an action to
  // update the state of the moved bubble in the participant meta map.
  const moveBox = (id: string, left: number, top: number) => {
    setBubs({ ...bubs, [id]: { ...bubs[id], left, top } });
    updateLocation(id, pxToLocation(left, top));
  };

  // Fn to get a psuedo random set of top/left values for a bubble.
  const initialPositionSeed = useCallback(() => {
    const midWidth = windowWidth / 2;
    const midHeight = windowHeight / 2;
    return [Math.random() * midWidth, Math.random() * midHeight];
  }, [windowWidth, windowHeight]);

  // Callback to convert a location tuple to top/left values.
  const locationToPx = useCallback(
    ([x, y]: LocationTuple) => {
      return [windowWidth * x, windowHeight * y];
    },
    [windowWidth, windowHeight]
  );

  // Update the local participant's position in the participant meta map. Only do this on first render and when
  // the window dimensions change.
  useEffect(() => {
    if (
      participantMeta[localParticipant.sid] &&
      participantMeta[localParticipant.sid].location &&
      participantMeta[localParticipant.sid].location[0] &&
      participantMeta[localParticipant.sid].location[1]
    ) {
      updateLocation(localParticipant.sid, participantMeta[localParticipant.sid].location);
    } else {
      const [left, top] = initialPositionSeed();
      updateLocation(localParticipant.sid, pxToLocation(left, top));
    }
  }, [windowWidth, windowHeight]); // Only update the local participants position if window size changes.

  // When the floater list or participant meta changes, update the bubbles positions.
  useEffect(() => {
    const newBubs = { ...bubs };

    // Array of sids that are present in the floaters list.
    const seenSids: string[] = [];
    // Iterate over floaters and add/update bubble position objects as necessary.
    floaters.forEach(fl => {
      if (!bubs[fl.sid]) {
        // Add the floater bubble.
        const [left, top] =
          participantMeta[fl.sid] && participantMeta[fl.sid].location
            ? locationToPx(participantMeta[fl.sid].location)
            : initialPositionSeed();
        newBubs[fl.sid] = { top, left, pt: fl };
        updateLocation(fl.sid, pxToLocation(left, top));
      } else if (participantMeta[fl.sid] && participantMeta[fl.sid].location) {
        const [left, top] = locationToPx(participantMeta[fl.sid].location);
        newBubs[fl.sid] = { ...newBubs[fl.sid], left, top };
      }
      seenSids.push(fl.sid);
    });

    // Delete bubble position objects for floaters that are no longer floaters.
    for (let sid in bubs) {
      if (!seenSids.includes(sid)) {
        // Remove the floater bubble.
        delete newBubs[sid];
      }
    }

    // Set the new bubble positions objects into state.
    setBubs(newBubs);
  }, [floaters, participantMeta]); // Only want to update the bubble memberships when floaters change. If bubs included, will enter infinite render loop.

  return (
    <div ref={drop} className="u-positionRelative u-height100Percent">
      {Object.keys(huddles).map(huddleId => (
        <HuddleBubble huddleId={huddleId} participants={huddles[huddleId]} key={huddleId} />
      ))}
      <div key="widgies" className="u-flex u-flexWrap u-floatRight u-flexJustifyEnd" style={{ maxWidth: '40%' }}>
        {widgetLinks.map(widget => (
          <div key={widget.id} style={{ margin: 10 }}>
            <LinkWidget
              title={widget.data.title}
              url={widget.data.url}
              onCloseHandler={() => removeWidget(widget.id)}
              participant={
                widget.participantSid === localParticipant.sid
                  ? localParticipant
                  : remoteParticipants.find(pt => pt.sid === widget.participantSid)
              }
            />
          </div>
        ))}
      </div>
      <div>
        {widgetWhiteboard ? (
          <Whiteboard
            onCloseHandler={() => removeWidget(widgetWhiteboard.id)}
            whiteboardId={widgetWhiteboard.data.whiteboardId}
          />
        ) : null}
      </div>
      {Object.keys(bubs).map(key => {
        const { pt, top, left } = bubs[key];

        return (
          <DraggableItem key={key} id={key} left={left} top={top} isDraggable={pt.sid === localParticipant.sid}>
            <div
              className={clsx('u-layerSurfaceDelta ', style.participantBubble, { 'u-blur': localHuddle })}
              key={pt.sid}
            >
              <ParticipantCircle
                participant={pt}
                onClick={() => null}
                disableAudio={disabledAudioSids.includes(pt.sid)}
              />
            </div>
          </DraggableItem>
        );
      })}
      <SharedScreenViewer />
    </div>
  );
};
