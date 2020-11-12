import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { useMemo, useEffect } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useCoordinatedDispatch } from './CoordinatedDispatchProvider';
import { actions } from './roomSlice';
import { logger } from '../../utils/logger';

export function useCleanupDisconnectedPeople() {
  const selectPeopleIds = useMemo(
    () =>
      createSelector(
        (state: RootState) => state.room.people,
        (people) => Object.keys(people)
      ),
    []
  );
  const peopleIds = useSelector((state: RootState) => selectPeopleIds(state));

  const { allParticipants } = useVideoContext();
  const allParticipantIds = useMemo(() => allParticipants.reduce((set, p) => set.add(p.sid), new Set<string>()), [
    allParticipants,
  ]);

  const dispatch = useCoordinatedDispatch();

  useEffect(() => {
    for (const id of peopleIds) {
      if (!allParticipantIds.has(id)) {
        logger.debug(`Cleaning up disconnected peer: ${id}`);
        dispatch(actions.removePerson({ id }));
      }
    }
  }, [peopleIds, allParticipantIds, dispatch]);
}
