import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import useVideoContext from '../useVideoContext/useVideoContext';

export function useCanEnterRoom() {
  const { room } = useVideoContext();

  const numberOfOthers = room?.participants?.size;
  const isFirstInRoom = numberOfOthers === 0;

  // this flag will get set whenever we receive a PING from another participant
  const hasReceivedPing = useSelector((state: RootState) => state.__unsafe.receivedPing);

  const canEnterRoom = isFirstInRoom || hasReceivedPing;

  return canEnterRoom;
}
