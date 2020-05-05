import { Participant } from 'twilio-video';

export default function useParticipantDisplayIdentity(participant?: Participant) {
  /*
   * The token server appends a UUIDv4 hash onto the screen name supplied by
   * the user. So, the hash needs to be removed before displaying the name to
   * the user to prevent confusion and showing really ugly hashes in the UI.
   * Format of the participant.identity is <screenName>#!<UUIDv4Hash>
   */
  if (participant) {
    const hashBangLocation = participant.identity.search(/#!/);
    const participantDisplayIdentity = participant.identity.slice(0, hashBangLocation);
    return participantDisplayIdentity;
  }
  // Assuming this will never be hit
  return;
}
