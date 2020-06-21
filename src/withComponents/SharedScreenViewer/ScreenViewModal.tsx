import React, { useEffect } from 'react';

import Publication from '../../components/Publication/Publication';
import { LocalParticipant, RemoteParticipant, RemoteTrackPublication } from 'twilio-video';
import usePublications from '../../hooks/usePublications/usePublications';
import { useParticipantMetaContext } from '../ParticipantMetaProvider/useParticipantMetaContext';

import { SharedScreenModal } from '../SharedScreenModal/SharedScreenModal';
import { AnimatePresence, motion } from 'framer-motion';

export const ScreenViewModal: React.FC<{ participant: LocalParticipant | RemoteParticipant }> = ({ participant }) => {
  const { updateScreenViewSid } = useParticipantMetaContext();

  const pubs = usePublications(participant);
  const screenPub = pubs.find(pub => pub.trackName === 'screen');

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
    <>
      <AnimatePresence>
        {screenPub ? (
          <SharedScreenModal
            close={() => {
              updateScreenViewSid('');
            }}
          >
            <Publication participant={participant} publication={screenPub} isLocal={false} />
          </SharedScreenModal>
        ) : null}
      </AnimatePresence>
    </>
  );
};
