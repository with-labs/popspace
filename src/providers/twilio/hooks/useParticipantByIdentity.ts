import { useTwilio } from '../TwilioProvider';

/**
 * Looks up a Twilio participant by their display identity string
 */
export function useParticipantByIdentity(identity: string | null) {
  const { allParticipants } = useTwilio();

  return allParticipants.find((p) => p?.identity === identity) ?? null;
}
