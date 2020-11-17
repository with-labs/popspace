import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { actions } from '../roomSlice';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import { fuzzVector } from '../../../utils/math';
import { RootState } from '../../../state/store';
import { createSelector } from '@reduxjs/toolkit';
import { randomAvatar } from '../../../utils/AvatarOptions';

/**
 * Enforces that a user is always present within the current room, and returns
 * their state data.
 */
export function useEnforcedPersonSelector(sid: string) {
  const personSelector = useMemo(
    () =>
      createSelector(
        (state: RootState) => state.room.people,
        (_: any, personId?: string) => personId,
        (people, personId) => (personId && people[personId]) || null
      ),
    []
  );
  const person = useSelector((state: RootState) => personSelector(state, sid));
  const isInRoom = !!person;

  const dispatch = useCoordinatedDispatch();

  useEffect(() => {
    if (!isInRoom) {
      dispatch(
        actions.addPerson({
          position: fuzzVector({ x: 0, y: 0 }, 100),
          person: {
            id: sid,
            avatar: randomAvatar().name,
          },
        })
      );
    }
  }, [isInRoom, sid, dispatch]);

  return person;
}
