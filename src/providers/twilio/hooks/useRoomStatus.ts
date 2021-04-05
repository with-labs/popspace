import { useTwilio } from '../TwilioProvider';

/**
 * Returns the connection status of the Twilio media room
 */
export function useRoomStatus() {
  return useTwilio().status;
}
