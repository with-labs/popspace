import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { useViewport } from '../viewport/useViewport';

export interface IViewportWallpaperProps {
  children?: React.ReactNode;
  imageUrl?: string | null;
  color?: string;
  wallpaperRepeats?: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    borderRadius: theme.shape.borderRadius,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    zIndex: 0,
  },
  wallpaperRepeat: {
    backgroundRepeat: 'repeat',
  },
}));

/**
 * Renders a wallpaper inside a viewport which stretches to the bounds of the
 * enclosed canvas.
 */
export const CanvasWallpaper: React.FC<IViewportWallpaperProps> = ({ children, imageUrl, wallpaperRepeats, color }) => {
  const classes = useStyles();

  const viewport = useViewport();

  const style = React.useMemo(() => {
    const canvasRect = viewport.canvasRect;
    return {
      backgroundColor: color,
      backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
      width: canvasRect.width,
      height: canvasRect.height,
      left: canvasRect.x,
      top: canvasRect.y,
    };
  }, [imageUrl, color, viewport]);

  return (
    <div style={style} className={clsx(classes.root, wallpaperRepeats && classes.wallpaperRepeat)}>
      {children}
    </div>
  );
};
