import * as React from 'react';
import { useRoomViewport } from '../../RoomViewport';
import { Box, makeStyles, IconButton, Tooltip } from '@material-ui/core';
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from '@material-ui/icons';
import clsx from 'clsx';
import { useKeyboardControls } from './useKeyboardControls';
import { useTranslation } from 'react-i18next';

const DEFAULT_PAN_INCREMENT = 100;
const DEFAULT_ZOOM_INCREMENT = 0.2;

export interface IViewportControlsProps {
  className?: string;
  panIncrement?: number;
  zoomIncrement?: number;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    right: theme.spacing(2),
    bottom: theme.spacing(2),
  },
  controlCluster: {
    padding: theme.spacing(1),

    display: 'grid',
    gridTemplateAreas: '"_1 up _2" "left _3 right" "_4 down _5" "zoomOut _6 zoomIn"',
    gridTemplateRows: 'repeat(4, 1fr)',
    gridTemplateColumns: 'repeat(3, 1fr)',

    borderRadius: 12,
  },
  controlsActive: {
    outline: 'none',
    background: theme.palette.background.paper,
  },
}));

export const ViewportControls = React.memo<IViewportControlsProps>(
  ({ className, panIncrement: increment = DEFAULT_PAN_INCREMENT, zoomIncrement = DEFAULT_ZOOM_INCREMENT }) => {
    const classes = useStyles();
    const controls = useRoomViewport();
    const { t } = useTranslation();

    const handleLeft = () => {
      controls.pan({ x: -increment, y: 0 });
    };
    const handleRight = () => {
      controls.pan({ x: increment, y: 0 });
    };
    const handleUp = () => {
      controls.pan({ x: 0, y: -increment });
    };
    const handleDown = () => {
      controls.pan({ x: 0, y: increment });
    };
    const handleZoomIn = () => {
      controls.zoom(zoomIncrement);
    };
    const handleZoomOut = () => {
      controls.zoom(-zoomIncrement);
    };

    const { props: bindKeyboard, isActive } = useKeyboardControls(controls);
    const toolTip = t('features.room.viewportControlsToolTip');

    return (
      <Box className={clsx(classes.root, className)}>
        <Tooltip disableHoverListener disableFocusListener disableTouchListener open={isActive} title={toolTip}>
          <div
            className={clsx(classes.controlCluster, isActive && classes.controlsActive)}
            aria-label="pan and zoom controls"
            {...bindKeyboard}
          >
            <IconButton onClick={handleLeft} style={{ gridArea: 'left' }} aria-label="left" size="small" tabIndex={-1}>
              <ArrowLeft />
            </IconButton>
            <IconButton
              onClick={handleRight}
              style={{ gridArea: 'right' }}
              aria-label="right"
              size="small"
              tabIndex={-1}
            >
              <ArrowRight />
            </IconButton>
            <IconButton onClick={handleUp} style={{ gridArea: 'up' }} aria-label="up" size="small" tabIndex={-1}>
              <ArrowLeft style={{ transform: 'rotate(90deg)' }} />
            </IconButton>
            <IconButton onClick={handleDown} style={{ gridArea: 'down' }} aria-label="down" size="small" tabIndex={-1}>
              <ArrowRight style={{ transform: 'rotate(90deg)' }} />
            </IconButton>
            <IconButton
              onClick={handleZoomOut}
              style={{ gridArea: 'zoomOut' }}
              aria-label="zoom out"
              size="small"
              tabIndex={-1}
            >
              <ZoomOut />
            </IconButton>
            <IconButton
              onClick={handleZoomIn}
              style={{ gridArea: 'zoomIn' }}
              aria-label="zoom in"
              size="small"
              tabIndex={-1}
            >
              <ZoomIn />
            </IconButton>
          </div>
        </Tooltip>
      </Box>
    );
  }
);
