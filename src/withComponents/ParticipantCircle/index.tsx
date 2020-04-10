import React, { useState } from 'react';
import clsx from 'clsx';
import './index.css';

import Publication from '../../components/Publication/Publication';
import usePublications from '../../hooks/usePublications/usePublications';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';

import { LocalParticipant, RemoteParticipant, Track } from 'twilio-video';

interface ParticipantCircleProps {
  participant: LocalParticipant | RemoteParticipant;
  disableAudio?: boolean;
  enableScreenShare?: boolean;
  videoPriority?: Track.Priority;
  styles?: object;
  onClick: () => void;
}

const ParticipantCircle = (props: ParticipantCircleProps) => {
  const { participant, disableAudio, enableScreenShare, videoPriority, styles, onClick } = props;
  const [isHovering, setIsHovering] = useState(false);

  const { room } = useVideoContext();
  const publications = usePublications(participant);
  const participantDisplayIdentity = useParticipantDisplayIdentity(participant);
  const isLocal = participant === room.localParticipant;

  let filteredPublications;

  if (enableScreenShare && publications.some(p => p.trackName === 'screen')) {
    filteredPublications = publications.filter(p => p.trackName !== 'camera');
  } else {
    filteredPublications = publications.filter(p => p.trackName !== 'screen');
  }

  return (
    <div
      className="ParticipantCircle"
      style={styles}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onClick()}
    >
      {filteredPublications.map(publication => (
        <div key={publication.kind} className="ParticipantCircle-participant">
          <Publication
            publication={publication}
            participant={participant}
            isLocal={isLocal}
            disableAudio={disableAudio}
            videoPriority={videoPriority}
            classNames={'ParticipantCircle-videoCircle'}
          />
        </div>
      ))}
      <div className={clsx('ParticipantCircle-infoOverlay', { 'is-hovering': isHovering || disableAudio })}>
        <div className="ParticipantCircle-overLayText">{participantDisplayIdentity}</div>
      </div>
    </div>
  );
};

export default ParticipantCircle;
