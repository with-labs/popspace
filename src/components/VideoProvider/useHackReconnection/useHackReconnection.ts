import { Room } from 'twilio-video';
import { useEffect } from 'react';
import { RoomEvent } from '../../../constants/twilio';

/**
 * Because our app is stateful and that state is managed using peer-to-peer syncing,
 * reconnection is really complicated. We need to clear local state, receive a new
 * state snapshot from peers, etc. Plus, there's something weird with Twilio right
 * now where reconnecting breaks the creation of new media publications.
 *
 * To avoid all this mess, just disable reconnect behavior entirely - we kick
 * ourselves out instead, then the app will automatically reconnect us when the
 * page reloads.
 */
export function useHackReconnection(room: Room | null) {
  useEffect(() => {
    if (!room) return;

    const justDisconnectAndStartOver = () => {
      window.location.reload();
    };
    room.on(RoomEvent.Reconnecting, justDisconnectAndStartOver);

    return () => {
      room.off(RoomEvent.Reconnecting, justDisconnectAndStartOver);
    };
  });
}
