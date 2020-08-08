/**
 * Handy hook to get the participant meta for a given participant. Makes accessing this data much nicer than having
 * to grab all the meta and select the participant's meta all over the place.
 */

import { useParticipantMetaContext } from '../../withComponents/ParticipantMetaProvider/useParticipantMetaContext';
import { LocalParticipant, RemoteParticipant, Participant } from 'twilio-video';

// export function useParticipantMeta(participant: LocalParticipant | RemoteParticipant) {
export function useParticipantMeta(participant: Participant) {
  const { participantMeta } = useParticipantMetaContext();

  return (participant && participantMeta[participant.sid]) || {};
}
