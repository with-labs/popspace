import client from '@api/client';
import { RoomWallpaper } from '@api/roomState/types/common';
import { useRoomStore } from '@api/useRoomStore';
import { SkeletonList } from '@components/SkeletonList/SkeletonList';
import { ButtonBase, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

export interface IWallpaperGridProps {
  wallpaperList: RoomWallpaper[];
  loading?: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(auto-fill, 120px)',
    gridAutoRows: '120px',
    gridGap: theme.spacing(2),
    padding: theme.spacing(0.5),
  },
  item: {
    borderRadius: theme.shape.contentBorderRadius,
    overflow: 'hidden',

    transition: theme.transitions.create(['box-shadow', 'padding']),

    position: 'relative',
    paddingTop: '100%',

    backgroundRepeat: 'both',
    backgroundSize: 'contain',

    '&:focus:not($itemSelected), &:hover:not($itemSelected)': {
      boxShadow: `0 0 0 4px ${theme.palette.grey[500]}`,
      padding: 4,
    },
    '&:active': {
      boxShadow: `0 0 0 4px ${theme.palette.grey[900]}`,
      padding: 4,
    },
  },
  itemSelected: {
    boxShadow: `0 0 0 4px ${theme.palette.secondary.dark}`,
    padding: 4,
  },
  toolTip: {
    backgroundColor: theme.palette.brandColors.snow.regular,
    borderRadius: theme.shape.contentBorderRadius,
    minWidth: '200px',
    padding: theme.spacing(1),
    boxShadow: theme.mainShadows.surface,
    color: theme.palette.brandColors.ink.regular,
  },
  author: {
    fontWeight: 'bold',
  },
}));

export const WallpaperGrid: React.FC<IWallpaperGridProps> = ({ wallpaperList, loading }) => {
  const classes = useStyles();
  const currentWallpaperId = useRoomStore((room) => room.wallpaper?.id || null);
  const onChange = client.wallpapers.setWallpaper;

  return (
    <div className={classes.root}>
      {loading ? (
        <SkeletonList />
      ) : (
        wallpaperList.map((wallpaper) => (
          <ButtonBase
            key={wallpaper.id}
            onClick={() => onChange(wallpaper)}
            className={clsx(classes.item, wallpaper.id === currentWallpaperId && classes.itemSelected)}
            aria-label={wallpaper.name}
            style={{
              backgroundImage: `url(${wallpaper.thumbnailUrl || wallpaper.url})`,
            }}
          ></ButtonBase>
        ))
      )}
    </div>
  );
};
