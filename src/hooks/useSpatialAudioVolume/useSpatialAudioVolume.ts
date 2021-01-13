import { vectorDistance } from '../../utils/math';
import { useCallback } from 'react';
import { useCurrentUserProfile } from '../useCurrentUserProfile/useCurrentUserProfile';
import { useRoomStore } from '../../roomState/useRoomStore';

// in world space coordinates - this is the farthest possible distance
// you can hear someone / something from - even if very faintly.
// To allow people to find quiet spaces, we probably want this to be
// no larger than 3/4 the room size, maybe smaller
const MAX_RANGE = 1200;

function computeVolumeFalloff(percentOfMaxRange: number) {
  return 1 / (Math.pow(percentOfMaxRange + 0.4, 20) + 1);
}

/**
 * Compute the audio volume based on the position of an object relative to the
 * active person.
 *
 * TODO: make this accept a callback instead, which updates the volume
 * outside of the React render loop - otherwise it re-renders everything
 * on move!
 *
 * @param objectId The ID of any object in the room state - widget or person
 */
export function useSpatialAudioVolume(objectKind: 'widget' | 'user', objectId: string | null) {
  const { user } = useCurrentUserProfile();
  const localUserId = user?.id ?? null;

  const localUserPosition = useRoomStore(
    useCallback((room) => room.userPositions[localUserId ?? '']?.position, [localUserId])
  ) ?? { x: 0, y: 0 };
  const otherPosition = useRoomStore(
    useCallback(
      (room) =>
        objectKind === 'widget'
          ? room.widgetPositions[objectId ?? '']?.position
          : room.userPositions[objectId ?? '']?.position,
      [objectId, objectKind]
    )
  ) ?? {
    x: 0,
    y: 0,
  };

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
  // The equation used here is arbitrary. It was selected because the curve
  // it produces matches the design team's desire for how user's experince
  // audio in the space of the room. Look at the link above to see the
  // curve generated (desmos.com link).
  const volume = computeVolumeFalloff(dist);

  return volume;
}
