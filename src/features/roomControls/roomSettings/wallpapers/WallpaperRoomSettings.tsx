import { Spacing } from '@components/Spacing/Spacing';
import { makeStyles } from '@material-ui/core';
import * as React from 'react';

import { CustomWallpaperForm } from './CustomWallpaperForm';
import { WallpaperAppearanceSettings } from './WallpaperAppearanceSettings';
import { WallpaperList } from './WallpaperList';

const useStyles = makeStyles((theme) => ({
  wallpaperList: {
    flex: 1,
  },
}));

export function WallpaperRoomSettings() {
  const classes = useStyles();

  return (
    <Spacing flex="1" flexDirection="row" width="100%" height="100%">
      <WallpaperList className={classes.wallpaperList} />
      <Spacing flexDirection="column">
        <CustomWallpaperForm />
        <WallpaperAppearanceSettings style={{ marginTop: 'auto' }} />
      </Spacing>
    </Spacing>
  );
}
