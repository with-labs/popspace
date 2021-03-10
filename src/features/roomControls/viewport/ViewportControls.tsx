import * as React from 'react';
import { useRoomViewport } from '../../room/RoomViewport';
import { Box, makeStyles, IconButton, Paper, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { PlusIcon } from '../../../components/icons/PlusIcon';
import { MinusIcon } from '../../../components/icons/MinusIcon';
import { useFeatureFlag } from 'flagg';

const DEFAULT_ZOOM_INCREMENT = 0.2;

export interface IViewportControlsProps {
  className?: string;
  zoomIncrement?: number;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    right: theme.spacing(2),
    bottom: theme.spacing(2),
  },
  offsetBottom: {
    bottom: 72,
  },
  controlCluster: {
    padding: theme.spacing(1),

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
}));

export const ViewportControls = React.memo<IViewportControlsProps>(
  ({ className, zoomIncrement = DEFAULT_ZOOM_INCREMENT }) => {
    const classes = useStyles();
    const controls = useRoomViewport();

    const [zoomValue, setZoomValue] = React.useState(controls.getZoom());

    React.useEffect(() => {
      function updateZoom() {
        setZoomValue(controls.getZoom());
      }
      controls.events.on('zoomEnd', updateZoom);
      return () => {
        controls.events.off('zoomEnd', updateZoom);
      };
    }, [controls]);

    const handleZoomIn = () => {
      controls.zoom(zoomIncrement);
    };
    const handleZoomOut = () => {
      controls.zoom(-zoomIncrement);
    };

    // forces an offset when feature flag for horizontal bar is active
    const [isVerticalTaskbar] = useFeatureFlag('verticalTaskbar');

    return (
      <Box component={Paper} className={clsx(classes.root, !isVerticalTaskbar && classes.offsetBottom, className)}>
        <div className={clsx(classes.controlCluster)}>
          <IconButton onClick={handleZoomOut} aria-label="zoom out" size="small">
            <MinusIcon aria-hidden fontSize="default" />
          </IconButton>
          {/* TODO: display percentage when this moves into room menu */}
          {/* <Typography variant="button">{`${Math.floor(zoomValue * 100)}%`}</Typography> */}
          <IconButton onClick={handleZoomIn} aria-label="zoom in" size="small">
            <PlusIcon aria-hidden fontSize="default" />
          </IconButton>
        </div>
      </Box>
    );
  }
);
