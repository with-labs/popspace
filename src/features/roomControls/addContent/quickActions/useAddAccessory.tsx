import { useCallback } from 'react';
import { addVectors } from '../../../../utils/math';
import { useRoomViewport } from '../../../room/RoomViewport';
import { Vector2 } from '../../../../types/spatials';
import { useGetLinkData } from '../../../room/widgets/link/useGetLinkData';
import { useFeatureFlag } from 'flagg';
import { LinkWidgetState, WidgetStateByType, WidgetType } from '../../../../roomState/types/widgets';
import { useCurrentUserProfile } from '../../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { useRoomStore } from '../../../../roomState/useRoomStore';

/**
 * Creates a new accessory near the center of the user's viewport,
 * assigning them as the owner and by default making it a draft.
 */
export function useAddAccessory() {
  const { user } = useCurrentUserProfile();
  const userId = user?.id;

  const viewport = useRoomViewport();

  const getLinkData = useGetLinkData();
  const [hasOpengraph] = useFeatureFlag('opengraph');

  const addWidget = useRoomStore((room) => room.api.addWidget);

  return useCallback(
    async <Type extends WidgetType>({
      type,
      initialData,
      screenCoordinate = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    }: {
      type: Type;
      initialData: WidgetStateByType[Type];
      screenCoordinate?: Vector2;
    }) => {
      const centerOfScreen = viewport.toWorldCoordinate(screenCoordinate);

      // add some fuzz so things don't stack perfectly
      const position = addVectors(centerOfScreen, {
        x: Math.random() * 50 - 25,
        y: Math.random() * 50 - 25,
      });

      if (!userId) {
        throw new Error('Cannot create a widget without logging in');
      }

      // a bit of an awkward edge case - perhaps we could refactor how this works.
      // add opengraph data to links
      let data = initialData;
      // kind of a heuristic - only fetch opengraph data if we don't already
      // have a media preview
      if (hasOpengraph && type === WidgetType.Link && !(initialData as LinkWidgetState).mediaUrl) {
        // FIXME: any cast
        data = (await getLinkData(initialData as LinkWidgetState)) as any;
      }

      return addWidget({
        type,
        transform: {
          position,
        },
        widgetState: data,
      });
    },
    [addWidget, userId, viewport, getLinkData, hasOpengraph]
  );
}
