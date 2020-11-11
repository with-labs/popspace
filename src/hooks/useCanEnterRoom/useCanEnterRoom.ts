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
  const [wasFirstInRoom, setWasFirstInRoom] = useState(false);
  useEffect(() => {
    if (isFirstInRoom) setWasFirstInRoom(true);
  }, [isFirstInRoom]);
  // reset wasFirstInRoom when you switch rooms
  useEffect(() => {
    if (!roomExists) setWasFirstInRoom(false);
  }, [roomExists]);

  // this flag will get set whenever we receive a PING from another participant
  const hasReceivedPing = useSelector((state: RootState) => state.room.syncedFromPeer);

  const canEnterRoom = wasFirstInRoom || hasReceivedPing;

  return canEnterRoom;
}
