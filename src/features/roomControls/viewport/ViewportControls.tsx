import * as React from 'react';
import { useRoomViewport } from '../../room/RoomViewport';
import { Box, Hidden, IconButton, Paper, Typography } from '@material-ui/core';
import { PlusIcon } from '../../../components/icons/PlusIcon';
import { MinusIcon } from '../../../components/icons/MinusIcon';
import { CenterButton } from './CenterButton';
import { WallpaperPicker } from './WallpaperPicker';
import { Spacing } from '../../../components/Spacing/Spacing';

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
    const controls = useRoomViewport();

    const [zoomValue, setZoomValue] = React.useState(controls.getZoom());

    React.useEffect(() => {
      function updateZoom() {
        setZoomValue(controls.getZoom());
      }
      if (!showZoomValue) return;

      controls.events.on('zoomEnd', updateZoom);
      return () => {
        controls.events.off('zoomEnd', updateZoom);
      };
    }, [controls, showZoomValue]);

    const handleZoomIn = () => {
      controls.zoomAbsolute(roundTenths(controls.getZoom() + zoomIncrement));
    };
    const handleZoomOut = () => {
      controls.zoomAbsolute(roundTenths(controls.getZoom() - zoomIncrement));
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
