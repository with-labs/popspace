import { RoomWallpaper } from '@api/roomState/types/common';
import { Spacing, SpacingProps } from '@components/Spacing/Spacing';
import { makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import groupBy from 'lodash/groupBy';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useWallpapers } from './useWallpapers';
import { WallpaperGrid } from './WallpaperGrid';

export interface WallpaperListProps extends SpacingProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: 'auto',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    '&::-webkit-scrollbar-track': {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
    },
  },
  title: {
    marginBottom: theme.spacing(1),
  },
}));

export const WallpaperList: React.FC<WallpaperListProps> = ({ className, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [wallpapers] = useWallpapers();

  const groupedWallpapers: Record<string, RoomWallpaper[]> = React.useMemo(() => {
    if (!wallpapers) return {};
    return groupBy(wallpapers, (wp: RoomWallpaper) => wp.category);
  }, [wallpapers]);

  return (
    <Spacing flexDirection="column" className={clsx(classes.root, className)} {...props}>
      {Object.keys(groupedWallpapers).map((category) => {
        return (
          <div key={category}>
            <Typography variant="h3" className={classes.title}>
              {t(`features.roomSettings.wallpapers.categories.${category}`)}
            </Typography>
            <WallpaperGrid wallpaperList={groupedWallpapers[category]} loading={!wallpapers} />
          </div>
        );
      })}
    </Spacing>
  );
};
