import { Spacing } from '@components/Spacing/Spacing';
import { Box, makeStyles } from '@material-ui/core';
import * as React from 'react';

import { CustomWallpaperForm } from './CustomWallpaperForm';
import { WallpaperAppearanceSettings } from './WallpaperAppearanceSettings';
import { WallpaperList } from './WallpaperList';

const useStyles = makeStyles((theme) => ({
  wallpaperList: {
    flex: '3 0 0',
  },
  sidebar: {
    flex: '1 0 0',
  },
}));

export function WallpaperRoomSettings() {
  const classes = useStyles();

  return (
    <Box display="flex" width="100%">
      <WallpaperList className={classes.wallpaperList} />
      <Spacing flexDirection="column" p={4} pl={3} className={classes.sidebar}>
        <CustomWallpaperForm />
        <WallpaperAppearanceSettings style={{ marginTop: 'auto' }} />
      </Spacing>
    </Box>
  );
}
