import { useLocalParticipant } from '../../hooks/useLocalParticipant/useLocalParticipant';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectors, actions } from './roomSlice';
import { useCoordinatedDispatch } from './CoordinatedDispatchProvider';
import { fuzzVector } from '../../utils/math';
import { randomAvatar } from '../../utils/AvatarOptions';

/**
 * Enforces that the active local user is always
 * present within the current room.
 */
export function useRoomPresence() {
  const localParticipant = useLocalParticipant();
  const sid = localParticipant?.sid;
  const person = useSelector(selectors.createPersonSelector(sid));
  const isInRoom = !!person;

  const dispatch = useCoordinatedDispatch();

  useEffect(() => {
    if (!isInRoom) {
      dispatch(
        actions.addPerson({
          position: fuzzVector({ x: 0, y: 0 }, 40),
          person: {
            id: sid,
            avatar: randomAvatar().name,
          },
        })
      );
    }
  }, [isInRoom, sid, dispatch]);
}
