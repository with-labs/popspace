import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useViewport } from '../viewport/useViewport';

export interface IViewportWallpaperProps {
  children?: React.ReactNode;
  imageUrl?: string;
  color?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    borderRadius: theme.shape.borderRadius,
    backgroundRepeat: 'repeat',
    backgroundSize: '2400px 2400px',
    zIndex: 0,
  },
}));

/**
 * Renders a wallpaper inside a viewport which stretches to the bounds of the
 * enclosed canvas.
 */
export const CanvasWallpaper: React.FC<IViewportWallpaperProps> = ({ children, imageUrl, color }) => {
  const classes = useStyles();

  const viewport = useViewport();

  const style = React.useMemo(() => {
    const canvasRect = viewport.canvasRect;
    return {
      backgroundColor: color,
      backgroundImage: imageUrl && `url(${imageUrl})`,
      width: canvasRect.width,
      height: canvasRect.height,
      left: canvasRect.x,
      top: canvasRect.y,
    };
  }, [imageUrl, color, viewport]);

  return (
    <div style={style} className={classes.root}>
      {children}
    </div>
  );
};
