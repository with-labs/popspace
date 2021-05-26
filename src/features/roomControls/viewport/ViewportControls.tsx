import * as React from 'react';
import { Box, Hidden, IconButton, Paper, Typography } from '@material-ui/core';
import { PlusIcon } from '@components/icons/PlusIcon';
import { MinusIcon } from '@components/icons/MinusIcon';
import { CenterButton } from './CenterButton';
import { WallpaperPicker } from './WallpaperPicker';
import { Spacing } from '@components/Spacing/Spacing';
import { useViewport } from '@providers/viewport/useViewport';
import throttle from 'lodash.throttle';

const DEFAULT_ZOOM_INCREMENT = 0.2;

export interface IViewportControlsProps {
  className?: string;
  zoomIncrement?: number;
  showZoomValue?: boolean;
}

function roundTenths(percentage: number) {
  return Math.round(percentage * 10) / 10;
}

export const ViewportControls = React.memo<IViewportControlsProps>(
  ({ className, zoomIncrement = DEFAULT_ZOOM_INCREMENT, showZoomValue }) => {
    const viewport = useViewport();

    const [zoomValue, setZoomValue] = React.useState(viewport.zoom);

    React.useEffect(() => {
      function updateZoom() {
        setZoomValue(viewport.zoom);
      }
      const throttledUpdateZoom = throttle(updateZoom, 300, { trailing: true });
      if (!showZoomValue) return;

      viewport.on('zoomChanged', throttledUpdateZoom);
      return () => {
        viewport.off('zoomChanged', throttledUpdateZoom);
      };
    }, [showZoomValue, viewport]);

    const handleZoomIn = () => {
      viewport.doZoom(roundTenths(viewport.zoom + zoomIncrement), {
        origin: 'control',
      });
    };
    const handleZoomOut = () => {
      viewport.doZoom(roundTenths(viewport.zoom - zoomIncrement), {
        origin: 'control',
      });
    };

    return (
      <Box component={Paper} className={className}>
        <Spacing flexDirection="row" alignItems="center" gap={1} p={1}>
          <CenterButton />
          <Hidden smDown>
            <IconButton onClick={handleZoomOut} aria-label="zoom out" size="small">
              <MinusIcon aria-hidden fontSize="default" />
            </IconButton>
            {showZoomValue && (
              <Typography variant="button" style={{ width: 50 }} align="center">{`${Math.floor(
                zoomValue * 100
              )}%`}</Typography>
            )}
            <IconButton onClick={handleZoomIn} aria-label="zoom in" size="small">
              <PlusIcon aria-hidden fontSize="default" />
            </IconButton>
          </Hidden>
          <WallpaperPicker />
        </Spacing>
      </Box>
    );
  }
);
