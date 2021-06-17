import * as React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { wallPaperOptions } from './WallpaperOptions';
import { WallpaperGrid } from './WallpaperGrid';
import { useTranslation } from 'react-i18next';
import { useRoomStore } from '@api/useRoomStore';

export interface IWallpaperCategroyProps {
  onChange: (wallpaperUrl: string, isCustomWallpaper: boolean) => void;
}

const useStyles = makeStyles((theme) => ({
  category: {
    marginBottom: '48px',
  },
  title: {
    marginBottom: theme.spacing(1),
  },
}));

export const WallpaperCategory: React.FC<IWallpaperCategroyProps> = ({ onChange }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const wallpaperUrl = useRoomStore((room) => room.state.wallpaperUrl);

  return (
    <div>
      {Object.keys(wallPaperOptions).map((category, idx) => {
        const selectedWallpaper = wallPaperOptions[category].some((w) => w.url === wallpaperUrl) ? wallpaperUrl : null;

        return (
          <div key={`${category}_${idx}`} className={classes.category}>
            <Typography variant="h3" className={classes.title}>
              {t(`modals.wallpaperModal.category.${category}`)}
            </Typography>
            <WallpaperGrid wallpaperList={wallPaperOptions[category]} onChange={onChange} value={selectedWallpaper} />
          </div>
        );
      })}
    </div>
  );
};
