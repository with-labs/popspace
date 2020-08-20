import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import { Emoji } from 'emoji-mart';

import './index.css';

import { ReactComponent as SettingsIcon } from '../../images/icons/settings.svg';

import Publication from '../../components/Publication/Publication';
import usePublications from '../../hooks/usePublications/usePublications';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useLocalAudioToggle from '../../hooks/useLocalAudioToggle/useLocalAudioToggle';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';

import { LocalParticipant, RemoteParticipant, Track } from 'twilio-video';

import { useParticipantMetaContext } from '../ParticipantMetaProvider/useParticipantMetaContext';
import { useParticipantMeta } from '../../withHooks/useParticipantMeta/useParticipantMeta';
import { useAvatar } from '../../withHooks/useAvatar/useAvatar';

import { Avatar } from '../Avatar/Avatar';

interface ParticipantCircleProps {
  participant: LocalParticipant | RemoteParticipant;
  disableAudio?: boolean;
  enableScreenShare?: boolean;
  videoPriority?: Track.Priority;
  onClick: () => void;
  style?: { [key: string]: string | number };
}

const ParticipantCircle = (props: ParticipantCircleProps) => {
  const sharedScreenBtnRef = useRef<HTMLDivElement>(null);
  const { participant, disableAudio, enableScreenShare, videoPriority, onClick, style = {} } = props;
  const meta = useParticipantMeta(participant);
  const [isAudioEnabled] = useLocalAudioToggle();
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringOverSettings, setIsHoveringOverSettings] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { updateEmoji, updateScreenViewSid } = useParticipantMetaContext();
  const { room } = useVideoContext();
  const publications = usePublications(participant);
  const isLocal = participant === room.localParticipant;

  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);
  const { emoji, avatar: avatarName, isSpeaking } = meta;
  const avatar = useAvatar(avatarName);

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
          'is-localParticipant': isLocal,
          'is-speaking': isSpeaking,
        })}
        style={style}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => onClick()}
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
};

export default ParticipantCircle;
