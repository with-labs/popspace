import * as React from 'react';
import { useRoomViewport } from '../../RoomViewport';
import { Box, makeStyles, IconButton } from '@material-ui/core';
import clsx from 'clsx';

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
  controlCluster: {
    padding: theme.spacing(1),
    borderRadius: 12,

    display: 'flex',
    flexDirection: 'column',

    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  button: {
    backgroundColor: theme.palette.background.paper,

    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
    },
    '&:focus': {
      background: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${theme.palette.secondary.dark}`,
    },
  },
  glyph: {
    width: 24,
    height: 24,
    fontSize: 24,
    lineHeight: '1',
  },
}));

export const ViewportControls = React.memo<IViewportControlsProps>(
  ({ className, zoomIncrement = DEFAULT_ZOOM_INCREMENT }) => {
    const classes = useStyles();
    const controls = useRoomViewport();

    const handleZoomIn = () => {
      controls.zoom(zoomIncrement);
    };
    const handleZoomOut = () => {
      controls.zoom(-zoomIncrement);
    };

    return (
      <Box className={clsx(classes.root, className)}>
        <div className={clsx(classes.controlCluster)}>
          <IconButton
            onClick={handleZoomIn}
            style={{ gridArea: 'zoomIn' }}
            aria-label="zoom in"
            size="small"
            className={classes.button}
          >
            <span aria-hidden className={classes.glyph}>
              +
            </span>
          </IconButton>
          <IconButton
            onClick={handleZoomOut}
            style={{ gridArea: 'zoomOut' }}
            aria-label="zoom out"
            size="small"
            className={classes.button}
          >
            <span aria-hidden className={classes.glyph}>
              -
            </span>
          </IconButton>
        </div>
      </Box>
    );
  }
);
