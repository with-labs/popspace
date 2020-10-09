import React, { useState, useRef, HTMLAttributes, useCallback, memo } from 'react';
import clsx from 'clsx';
import { Emoji } from 'emoji-mart';

import './index.css';

import Publication from '../../components/Publication/Publication';
import usePublications from '../../hooks/usePublications/usePublications';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';
import { LocalParticipant, RemoteParticipant, Track } from 'twilio-video';
import { Avatar } from '../Avatar/Avatar';
import { useSelector } from 'react-redux';
import { actions, selectors } from '../../features/room/roomSlice';
import { useCoordinatedDispatch } from '../../features/room/CoordinatedDispatchProvider';

interface ParticipantCircleProps extends HTMLAttributes<HTMLDivElement> {
  participant: LocalParticipant | RemoteParticipant;
  disableAudio?: boolean;
  enableScreenShare?: boolean;
  videoPriority?: Track.Priority;
}

const ParticipantCircle = memo((props: ParticipantCircleProps) => {
  const sharedScreenBtnRef = useRef<HTMLDivElement>(null);
  const { participant, disableAudio, enableScreenShare, videoPriority, ...rest } = props;
  const [isHovering, setIsHovering] = useState(false);
  const { room } = useVideoContext();
  const publications = usePublications(participant);
  const isLocal = participant === room.localParticipant;

  const person = useSelector(selectors.createPersonSelector(props.participant.sid));

  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);
  const { emoji, avatar: avatarName, isSpeaking } = person;

  const coordinatedDispatch = useCoordinatedDispatch();
  const updateScreenViewSid = useCallback(
    (screenViewSid: string) => {
      coordinatedDispatch(
        actions.updatePersonScreenViewSid({
          id: room.localParticipant.sid,
          screenViewSid,
        })
      );
    },
    [coordinatedDispatch, room.localParticipant.sid]
  );

  let filteredPublications;

  if (enableScreenShare && publications.some((p) => p.trackName === 'screen')) {
    filteredPublications = publications.filter((p) => p.trackName !== 'camera');
  } else {
    filteredPublications = publications.filter((p) => p.trackName !== 'screen');
  }

  // only local participant can see gear icon to open settings
  let emojiDisplay = null;
  if (emoji) {
    emojiDisplay = (
      <div
        className={clsx(
          'ParticipantCircle-settings u-layerSurfaceAlpha u-flex u-flexAlignItemsCenter u-flexJustifyCenter ParticipantCircle-menuItem ',
          {
            'is-set': emoji,
          }
        )}
      >
        <Emoji emoji={emoji} size={24} />
      </div>
    );
  }

  const screenShareTrack = publications.find((pub) => pub.trackName === 'screen');

  let screenShare = null;
  // only show the share sreen button to others in the room
  if (!isLocal && screenShareTrack) {
    screenShare = (
      <div
        ref={sharedScreenBtnRef}
        className="ParticipantCircle-screenSharePreview u-layerSurfaceAlpha u-flex u-flexAlignItemsCenter u-flexJustifyCenter"
        onClick={(e) => {
          e.stopPropagation();
          updateScreenViewSid(participant.sid);
        }}
      >
        <Publication publication={screenShareTrack} participant={participant} isLocal={isLocal} />
      </div>
    );
  }

  // `hasVideoPublication` can be used to change the circle's appearance. Below, if there is no video publication
  // an Avatar is rendered.
  let hasVideoPublication = false;
  const pubs = filteredPublications.map((publication) => {
    if (publication.kind === 'video') {
      hasVideoPublication = true;
    }
    return (
      <div key={publication.kind + publication.trackSid} className="ParticipantCircle-participant">
        <Publication
          publication={publication}
          participant={participant}
          isLocal={isLocal}
          disableAudio={disableAudio}
          videoPriority={videoPriority}
          classNames={'ParticipantCircle-videoCircle'}
        />
      </div>
    );
  });

  return (
    <>
      <div
        className={clsx('ParticipantCircle u-flex u-flexJustifyCenter', {
          'is-speaking': isSpeaking,
        })}
        onMouseEnter={(ev: any) => {
          setIsHovering(true);
          rest.onMouseEnter?.(ev);
        }}
        onMouseLeave={(ev: any) => {
          setIsHovering(false);
          rest.onMouseLeave?.(ev);
        }}
        {...rest}
      >
        {hasVideoPublication ? null : (
          <div className="ParticipantCircle-avatar">
            <Avatar name={avatarName} />
          </div>
        )}
        {emojiDisplay}
        {screenShare}
        {pubs}
        <div
          className={clsx('ParticipantCircle-infoOverlay', {
            'is-hovering': isHovering || disableAudio,
            'is-light': hasVideoPublication,
          })}
        >
          <div className={clsx('ParticipantCircle-overLayText', { 'is-light': hasVideoPublication })}>
            {participantDisplayIdentity}
          </div>
        </div>
      </div>
    </>
  );
});

export default ParticipantCircle;
