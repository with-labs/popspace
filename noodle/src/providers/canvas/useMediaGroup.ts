import { WidgetType } from '@api/roomState/types/widgets';
import { useRoomStore } from '@api/useRoomStore';
import { useEffect, useState } from 'react';

import { CanvasObjectKind } from './Canvas';
import { useCanvas } from './CanvasProvider';

export function useMediaGroup(objectId: string, objectKind: CanvasObjectKind) {
  const canvas = useCanvas();

  const [mediaGroup, setMediaGroup] = useState<string | null>(null);

  useEffect(
    () =>
      canvas.observeIntersections(objectId, objectKind, (data) => {
        let foundGroup: string | null = null;
        data.intersections.forEach((bound) => {
          if (bound.kind === 'widget' && useRoomStore.getState().widgets[bound.id]?.type === WidgetType.Huddle) {
            foundGroup = bound.id;
          }
        });
        setMediaGroup(foundGroup);
      }),
    [canvas, objectId, objectKind]
  );

  return mediaGroup;
}
