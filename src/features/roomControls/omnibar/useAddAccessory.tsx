import { useCallback } from 'react';
import { addVectors } from '../../../utils/math';
import { useLocalParticipant } from '../../../hooks/useLocalParticipant/useLocalParticipant';
import { useCoordinatedDispatch } from '../../room/CoordinatedDispatchProvider';
import { useRoomViewport } from '../../room/RoomViewport';
import { actions as roomActions } from '../../room/roomSlice';
import { WidgetData, WidgetType } from '../../../types/room';
import { Vector2 } from '../../../types/spatials';

/**
 * Creates a new accessory near the center of the user's viewport,
 * assigning them as the owner and by default making it a draft.
 */
export function useAddAccessory() {
  const user = useLocalParticipant();
  const userSid = user?.sid;

  const viewport = useRoomViewport();

  const dispatch = useCoordinatedDispatch();

  return useCallback(
    ({
      type,
      initialData,
      publishImmediately = false,
      screenCoordinate = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    }: {
      type: WidgetType;
      initialData: WidgetData;
      publishImmediately?: boolean;
      screenCoordinate?: Vector2;
    }) => {
      const centerOfScreen = viewport.toWorldCoordinate(screenCoordinate);

      // add some fuzz so things don't stack perfectly
      const position = addVectors(centerOfScreen, {
        x: Math.random() * 50 - 25,
        y: Math.random() * 50 - 25,
      });

      if (userSid) {
        dispatch(
          roomActions.addWidget({
            position,
            widget: {
              kind: 'widget',
              type,
              participantSid: userSid,
              data: initialData,
              isDraft: !publishImmediately,
            },
          })
        );
      }
    },
    [dispatch, userSid, viewport]
  );
}
