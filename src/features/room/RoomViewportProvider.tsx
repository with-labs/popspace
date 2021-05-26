import * as React from 'react';
import shallow from 'zustand/shallow';
import { Viewport } from '@providers/viewport/Viewport';
import { ViewportProvider } from '@providers/viewport/ViewportProvider';
import { useRoomStore } from '@roomState/useRoomStore';

export interface IRoomViewportProviderProps {
  children?: React.ReactNode;
  minZoom?: number;
  maxZoom?: number;
}

export const RoomViewportProvider: React.FC<IRoomViewportProviderProps> = ({
  children,
  minZoom = 1 / 4,
  maxZoom = 2,
}) => {
  const bounds = useRoomStore((room) => ({ width: room.state.width, height: room.state.height }), shallow);

  const viewport = React.useMemo(
    () =>
      new Viewport({
        panLimitMode: 'viewport',
        defaultZoom: minZoom,
        canvasLimits: {
          min: {
            x: -bounds.width / 2,
            y: -bounds.height / 2,
          },
          max: {
            x: bounds.width / 2,
            y: bounds.height / 2,
          },
        },
        zoomLimits: {
          min: minZoom,
          max: maxZoom,
        },
      }),
    [bounds.height, bounds.width, maxZoom, minZoom]
  );

  React.useEffect(() => {
    // @ts-ignore for debugging!
    window.viewport = viewport;
  }, [viewport]);

  return <ViewportProvider value={viewport}>{children}</ViewportProvider>;
};
