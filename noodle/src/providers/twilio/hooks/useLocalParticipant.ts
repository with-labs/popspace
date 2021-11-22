import { useTwilio } from '../TwilioProvider';

export function useLocalParticipant() {
  const { room } = useTwilio();
  return room?.localParticipant ?? null;
}
