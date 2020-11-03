import { useCallback, useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../state/store';
import { useSelector } from 'react-redux';
import { useLocalParticipant } from '../useLocalParticipant/useLocalParticipant';
import { useCoordinatedDispatch } from '../../features/room/CoordinatedDispatchProvider';
import { actions } from '../../features/room/roomSlice';

export default function useScreenShareToggle() {
  const localParticpant = useLocalParticipant();

  const isSharingScreenSelector = useMemo(
    () =>
      createSelector(
        (state: RootState) => state.room.people,
        (_: any, personId: string) => personId,
        (people, personId) => {
          if (!people[personId]) return false;
          return people[personId].isSharingScreen;
        }
      ),
    []
  );

  const isSharingScreen = useSelector((state: RootState) => isSharingScreenSelector(state, localParticpant.sid));

  const coordinatedDispatch = useCoordinatedDispatch();

  const toggle = useCallback(() => {
    coordinatedDispatch(
      actions.updatePersonIsSharingScreen({
        id: localParticpant.sid,
        isSharingScreen: !isSharingScreen,
      })
    );
  }, [coordinatedDispatch, localParticpant.sid, isSharingScreen]);

  return [isSharingScreen, toggle] as const;
}
