import useVideoContext from '../useVideoContext/useVideoContext';

/**
 * Gets the first matching Twilio participant for a particular user.
 * NOTE: in our current model users could have multiple devices and
 * multiple sessions, which means multiple Twilio participants! But
 * this hook keeps things simple and just grabs the first one -
 * we probably don't want this behavior the majority of the time,
 * maybe ever.
 */
export function useTwilioParticipantForUser(userId: string) {
  const { allParticipants } = useVideoContext();
  // find the first participant with an identity matching the user ID
  return allParticipants.find((p) => p.identity.startsWith(userId)) ?? null;
}
