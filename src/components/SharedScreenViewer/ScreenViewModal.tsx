import React, { useCallback, useEffect } from 'react';

import Publication from '../Publication/Publication';
import { LocalParticipant, RemoteParticipant, RemoteTrackPublication } from 'twilio-video';
import usePublications from '../../hooks/usePublications/usePublications';

import { SharedScreenModal } from '../SharedScreenModal/SharedScreenModal';
import { AnimatePresence } from 'framer-motion';
import { useCoordinatedDispatch } from '../../features/room/CoordinatedDispatchProvider';
import { actions } from '../../features/room/roomSlice';
import { useLocalParticipant } from '../../hooks/useLocalParticipant/useLocalParticipant';

export const ScreenViewModal: React.FC<{ participant: LocalParticipant | RemoteParticipant }> = ({ participant }) => {
  const localParticipant = useLocalParticipant();

  const coordinatedDispatch = useCoordinatedDispatch();
  const updateScreenViewSid = useCallback(
    (sid: string) => {
      coordinatedDispatch(
        actions.updatePersonScreenViewSid({
          id: localParticipant.sid,
          screenViewSid: sid,
        })
      );
    },
    [coordinatedDispatch, localParticipant.sid]
  );

  const pubs = usePublications(participant);
  const screenPub = pubs.find((pub) => pub.trackName === 'screen');

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
