import { useCallback } from 'react';
import { addVectors } from '@utils/math';
import { Bounds, Vector2 } from '../../../../types/spatials';
import { useGetLinkData } from '../../../room/widgets/link/useGetLinkData';
import { LinkWidgetState, WidgetStateByType, WidgetType } from '@api/roomState/types/widgets';
import { Origin } from '@analytics/constants';
import { useViewport } from '@providers/viewport/useViewport';
import { useLocalActorId } from '@api/useLocalActorId';
import client from '@api/client';

/**
 * Creates a new accessory near the center of the user's viewport,
 * assigning them as the owner and by default making it a draft.
 */
export function useAddAccessory() {
  const userId = useLocalActorId();

  const viewport = useViewport();

  const getLinkData = useGetLinkData();

  return useCallback(
    async <Type extends WidgetType>(
      {
        type,
        initialData,
        screenCoordinate = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        size,
      }: {
        type: Type;
        initialData: WidgetStateByType[Type];
        screenCoordinate?: Vector2;
        size: Bounds;
      },
      origin?: Origin
    ) => {
      const centerOfScreen = viewport.viewportToWorld(screenCoordinate);

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
      if (type === WidgetType.Link) {
        // FIXME: any cast
        data = (await getLinkData(initialData as LinkWidgetState)) as any;
      }

      return client.widgets.addWidget(
        {
          type,
          transform: {
            position,
            size,
          },
          widgetState: data,
        },
        origin
      );
    },
    [userId, viewport, getLinkData]
  );
}
