import React, { useEffect } from 'react';

import Publication from '../../components/Publication/Publication';
import { LocalParticipant, RemoteParticipant, RemoteTrackPublication } from 'twilio-video';
import usePublications from '../../hooks/usePublications/usePublications';
import { useParticipantMetaContext } from '../ParticipantMetaProvider/useParticipantMetaContext';
import { WithModal } from '../WithModal/WithModal';
import useParticipantDisplayIdentity from '../../withHooks/useParticipantDisplayIdentity/useParticipantDisplayIdentity';

import styles from './ScreenViewModal.module.css';

export const ScreenViewModal: React.FC<{ participant: LocalParticipant | RemoteParticipant }> = ({ participant }) => {
  const { updateScreenViewSid } = useParticipantMetaContext();

  const pubs = usePublications(participant);
  const screenPub = pubs.find(pub => pub.trackName === 'screen');

  const ptDisplayName = useParticipantDisplayIdentity(participant);

  // Effect to clear the screen view sid if the remote participant stops sharing.
  useEffect(() => {
    const unPub = (publication: RemoteTrackPublication) => {
      if (publication.trackName === 'screen') {
        updateScreenViewSid('');
      }
    };
    participant.on('trackUnpublished', unPub);

    return () => {
      participant.off('trackUnpublished', unPub);
    };
  }, [participant, updateScreenViewSid]);

  return (
    <WithModal
      isOpen={!!screenPub}
      onCloseHandler={() => updateScreenViewSid('')}
      title={`${ptDisplayName}'s screen`}
      className={`${styles.modal}`}
    >
      {screenPub ? <Publication participant={participant} publication={screenPub} isLocal={false} /> : null}
    </WithModal>
  );
};
