import { useEffect, useState } from 'react';
import { WidgetType } from '@api/roomState/types/widgets';
import { useRoomStore } from '@api/useRoomStore';
import { useCanvas } from './CanvasProvider';

export function useMediaGroup(objectId: string) {
  const canvas = useCanvas();

  const [mediaGroup, setMediaGroup] = useState<string | null>(null);

  useEffect(
    () =>
      canvas.observeIntersections(objectId, (data) => {
        let foundGroup: string | null = null;
        data.intersections.forEach((bound) => {
          if (useRoomStore.getState().widgets[bound.id]?.type === WidgetType.Huddle) {
            foundGroup = bound.id;
          }
        });
        setMediaGroup(foundGroup);
      }),
    [canvas, objectId]
  );

  return mediaGroup;
}
