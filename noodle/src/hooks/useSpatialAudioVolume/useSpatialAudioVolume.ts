import { addVectors, vectorDistance } from '@utils/math';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { RoomStateShape, useRoomStore } from '@api/useRoomStore';
import { logger } from '@utils/logger';
import { MAX_AUDIO_RANGE as MAX_RANGE } from '@constants/room';
import { useCanvasObject } from '@providers/canvas/CanvasObject';
import { useLocalMediaGroup } from '@src/media/useLocalMediaGroup';

function computeVolumeFalloff(percentOfMaxRange: number) {
  return 1 / (Math.pow(percentOfMaxRange + 0.4, 20) + 1);
}

/**
 * Calls the supplied callback every time the volume changes based on
 * the room object you provide and its position relative to the user
 *
 * @returns a ref to the last recorded volume value for out-of-band usage
 */
export function useSpatialAudioVolume(callback: (volume: number) => any) {
  const { objectKind, objectId, mediaGroup } = useCanvasObject();
  const localMediaGroup = useLocalMediaGroup((store) => store.localMediaGroup);
  const isInLocalMediaGroup = mediaGroup === localMediaGroup;
  // "null" is a valid media group, this just checks to see if the object is
  // within a media group or in the 'global' space.
  const isInAMediaGroup = !!mediaGroup;

  const isAudioGlobal = useRoomStore((room) => room.state.isAudioGlobal);

  // storing in a ref to keep a stable reference
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const lastValue = useRef(0);

  useEffect(() => {
    const selectVolume = (room: RoomStateShape) => {
      if (!room.sessionId) return 0;

      // mute audio sources not in the local client's media group
      if (!isInLocalMediaGroup) return 0;

      // if the object is within a media group and it's the same as the local client (see previous
      // condition), disable spatial audio and go full volume. We don't use spatial audio inside
      // media groups (i.e. "huddles")
      if (isInAMediaGroup) return 1;

      // after dealing with media groups, we address global audio rooms
      if (isAudioGlobal) return 1;

      // finally, determine the volume based on the object's position relative to the user

      const objTransform =
        objectKind === 'widget' ? room.widgetPositions[objectId ?? ''] : room.userPositions[objectId ?? ''];
      const userPosition = room.userPositions[room.sessionLookup[room.sessionId]]?.position;

      const objPosition = objTransform?.position;

      if (!objPosition || !userPosition) return 0;

      // for widgets with a size, center the spatial audio computation position
      // in the center of the widget.
      const finalPosition =
        objectKind === 'widget' && objTransform.size
          ? addVectors(objPosition, { x: objTransform.size.width / 2, y: objTransform.size.height / 2 })
          : objPosition;

      const normalizedDistance =
        Math.max(Math.min(vectorDistance(finalPosition, userPosition), MAX_RANGE), 0) / MAX_RANGE;
      return computeVolumeFalloff(normalizedDistance);
    };

    lastValue.current = selectVolume(useRoomStore.getState());
    callbackRef.current(lastValue.current);

    return useRoomStore.subscribe((volume: number) => {
      lastValue.current = volume;
      // sanity check
      if (!isNaN(volume) && Number.isFinite(volume)) {
        callbackRef.current(volume);
      } else {
        logger.warn(`NaN volume for ${objectId}!`);
      }
    }, selectVolume);
  }, [objectId, objectKind, callbackRef, isInLocalMediaGroup, isInAMediaGroup, isAudioGlobal]);

  return lastValue;
}
