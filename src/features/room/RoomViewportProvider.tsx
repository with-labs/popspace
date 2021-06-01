import * as React from 'react';
import { Viewport } from '@providers/viewport/Viewport';
import { ViewportProvider } from '@providers/viewport/ViewportProvider';

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
  const viewport = React.useMemo(
    () =>
      new Viewport({
        panLimitMode: 'viewport',
        defaultZoom: minZoom,
        zoomLimits: {
          min: minZoom,
          max: maxZoom,
        },
      }),
    [maxZoom, minZoom]
  );

  React.useEffect(() => {
    // @ts-ignore for debugging!
    window.viewport = viewport;
  }, [viewport]);

  return <ViewportProvider value={viewport}>{children}</ViewportProvider>;
};
