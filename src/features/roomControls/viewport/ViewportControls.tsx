import * as React from 'react';
import { useRoomViewport } from '../../room/RoomViewport';
import { Box, makeStyles, Fab } from '@material-ui/core';
import clsx from 'clsx';
import { PlusIcon } from '../../../components/icons/PlusIcon';
import { MinusIcon } from '../../../components/icons/MinusIcon';

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
    flexDirection: 'row',

    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  button: {},
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
          <Fab onClick={handleZoomOut} aria-label="zoom out" size="small" className={classes.button}>
            <MinusIcon aria-hidden fontSize="default" />
          </Fab>
          <Fab onClick={handleZoomIn} aria-label="zoom in" size="small" className={classes.button}>
            <PlusIcon aria-hidden fontSize="default" />
          </Fab>
        </div>
      </Box>
    );
  }
);
