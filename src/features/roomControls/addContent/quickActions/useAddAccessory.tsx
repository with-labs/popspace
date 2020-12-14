import { useCallback } from 'react';
import { addVectors } from '../../../../utils/math';
import { useLocalParticipant } from '../../../../hooks/useLocalParticipant/useLocalParticipant';
import { useCoordinatedDispatch } from '../../../room/CoordinatedDispatchProvider';
import { useRoomViewport } from '../../../room/RoomViewport';
import { actions as roomActions } from '../../../room/roomSlice';
import { WidgetData, WidgetType, LinkWidgetData } from '../../../../types/room';
import { Vector2 } from '../../../../types/spatials';
import { useGetLinkData } from '../../../room/widgets/link/useGetLinkData';
import { useFeatureFlag } from 'flagg';

/**
 * Creates a new accessory near the center of the user's viewport,
 * assigning them as the owner and by default making it a draft.
 */
export function useAddAccessory() {
  const user = useLocalParticipant();
  const userSid = user?.sid;

  const viewport = useRoomViewport();

  const dispatch = useCoordinatedDispatch();

  const getLinkData = useGetLinkData();
  const [hasOpengraph] = useFeatureFlag('opengraph');

  return useCallback(
    async ({
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
        // a bit of an awkward edge case - perhaps we could refactor how this works.
        // add opengraph data to links
        let data = initialData;
        // kind of a heuristic - only fetch opengraph data if we don't already
        // have a media preview
        if (hasOpengraph && type === WidgetType.Link && !(initialData as LinkWidgetData).mediaUrl) {
          data = await getLinkData((initialData as LinkWidgetData).url);

          // reset the url we get from open graph, to the url the user provided
          (data as LinkWidgetData).url = (initialData as LinkWidgetData).url;
        }

        dispatch(
          roomActions.addWidget({
            position,
            widget: {
              kind: 'widget',
              type,
              participantSid: userSid,
              data,
              isDraft: !publishImmediately,
            },
          })
        );
      }
    },
    [dispatch, userSid, viewport, getLinkData, hasOpengraph]
  );
}
