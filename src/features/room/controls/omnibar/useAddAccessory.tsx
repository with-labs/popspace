import { useCallback } from 'react';
import { addVectors } from '../../../../utils/math';
import { useLocalParticipant } from '../../../../withHooks/useLocalParticipant/useLocalParticipant';
import { useCoordinatedDispatch } from '../../CoordinatedDispatchProvider';
import { useRoomViewport } from '../../RoomViewport';
import { actions as roomActions } from '../../roomSlice';
import { WidgetData, WidgetType } from '../../../../types/room';
import { Vector2 } from '../../../../types/spatials';

/**
 * Creates a new accessory near the center of the user's viewport,
 * assigning them as the owner and by default making it a draft.
 */
export function useAddAccessory() {
  const user = useLocalParticipant();

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

      dispatch(
        roomActions.addWidget({
          position,
          widget: {
            kind: 'widget',
            type,
            participantSid: user.sid,
            data: initialData,
            isDraft: !publishImmediately,
          },
        })
      );
    },
    [dispatch, user.sid, viewport]
  );
}
