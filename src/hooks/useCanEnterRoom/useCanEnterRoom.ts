import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import useVideoContext from '../useVideoContext/useVideoContext';
import { useState, useEffect } from 'react';

export function useCanEnterRoom() {
  const { room } = useVideoContext();

  const roomExists = !!room;
  const numberOfOthers = room?.participants?.size;
  const isFirstInRoom = roomExists && numberOfOthers === 0;

  // if you were ever the first person in the room, you are good - even if more
  // people join later.
  const [wasFirstInRoom, setWasFirstInRoom] = useState(isFirstInRoom);
  useEffect(() => {
    if (isFirstInRoom) setWasFirstInRoom(true);
  }, [isFirstInRoom]);

  // this flag will get set whenever we receive a PING from another participant
  const hasReceivedPing = useSelector((state: RootState) => state.room.syncedFromPeer);

  // finally, a timeout override. This is for the disaster case when there's a Twilio room
  // participant but they are not sending us a sync ping. It puts the user in another
  // dimension - they start a fresh Redux state in the same room.
  const [forceEntry, setForceEntry] = useState(false);
  useEffect(() => {
    if (room && !isFirstInRoom && !hasReceivedPing) {
      const timer = setTimeout(() => {
        setForceEntry(true);
      }, 30000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [room, isFirstInRoom, hasReceivedPing]);

  // reset wasFirstInRoom and forceEntry when you switch rooms
  useEffect(() => {
    if (!roomExists) {
      setWasFirstInRoom(false);
      setForceEntry(false);
    }
  }, [roomExists]);

  const canEnterRoom = wasFirstInRoom || hasReceivedPing || forceEntry;

  return canEnterRoom;
}
