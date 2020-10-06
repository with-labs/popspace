import { selectors } from '../../features/room/roomSlice';
import { useSelector } from 'react-redux';
import { useLocalParticipant } from '../useLocalParticipant/useLocalParticipant';
import { RootState } from '../../state/store';
import { createSelector } from '@reduxjs/toolkit';
import { vectorDistance } from '../../utils/math';
import { useMemo } from 'react';

// in world space coordinates
const MAX_RANGE = 1000;

export function useSpatialAudioVolume(objectId: string) {
  const useSpatialAudio = useSelector(selectors.selectUseSpatialAudio);
  const localParticipant = useLocalParticipant();
  const positionSelector = useMemo(
    () =>
      createSelector(
        (state: RootState) => state.room.positions,
        (_: any, id: string) => id,
        (positions, id) => positions[id]?.position ?? { x: 0, y: 0 }
      ),
    []
  );
  const localUserPosition = useSelector((state: RootState) => positionSelector(state, localParticipant.sid));
  const otherPosition = useSelector((state: RootState) => positionSelector(state, objectId));

  const distance = vectorDistance(localUserPosition, otherPosition);

  // The math for calculating the volume of a participant
  // is based on positioning of elements from top, left with a relative
  // range from 0 - 1, then multiplied by the screen width and height. There is
  // an assumption that all values for top and left are between 0 and 1.
  // However, there can be top and left values outside of that range, by dragging
  // and dropping a participant partially "off screen." Those scenarios cause
  // issues with the math needed to create the volume curves. So, I'm forcing
  // the valued between 0 and 1, via Math.min and Math.max
  const dist = Math.max(Math.min(distance, MAX_RANGE), 0) / MAX_RANGE;

  // The below limits and calculation derived from cosine curve, linked here
  // https://www.desmos.com/calculator/jobehh1xex
  let volume;

  // If spatial audio is turned off for the room, volume is always max
  if (!useSpatialAudio) {
    volume = 1;
    // if localParticipant is in a huddle with participant, participant volume should be max
  } else if (dist > 0.69) {
    volume = 0;
    // If distance reaches the peak or higher of the cosine curve, volume is max
  } else if (dist < 0.167) {
    volume = 1;
    // If 'else' block reached, calculate volume based on cosine curve
  } else {
    // The equation used here is arbitrary. It was selected because the curve
    // it produces matches the design team's desire for how user's experince
    // audio in the space of the room. Look at the link above to see the
    // curve generated (desmos.com link).
    volume = Math.cos(6 * dist - 1) / 2 + 0.5;
  }

  return volume;
}
