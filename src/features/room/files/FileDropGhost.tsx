import * as React from 'react';
import { Vector2 } from '../../../types/spatials';
import { makeStyles } from '@material-ui/core';

export interface IFileDropGhostProps {
  position: Vector2;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 50,
    width: 240,
    height: 180,
    backgroundColor: `rgba(255, 255, 255, 0.5)`,
    border: `2px solid ${theme.palette.common.white}`,
    borderRadius: theme.shape.borderRadius,
    opacity: 0.25,
    animationName: '$pulse',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    animationDuration: '2s',
  },
  '@keyframes pulse': {
    from: { opacity: 0.25 },
    to: { opacity: 1 },
  },
}));

/**
 * Renders a 'ghost' rectangle thing so the user knows their file
 * drop is available.
 */
export const FileDropGhost: React.FC<IFileDropGhostProps> = ({ position }) => {
  const classes = useStyles();
  return <div className={classes.root} style={{ transform: `translate(${position.x}px, ${position.y}px)` }} />;
};
