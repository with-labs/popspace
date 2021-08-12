import client from '@api/client';
import { useRoomStore } from '@api/useRoomStore';
import { FormControlLabel, Radio, RadioGroup, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export function WallpaperAppearanceSettings(props: React.HTMLAttributes<HTMLDivElement>) {
  const { t } = useTranslation();

  const repeats = useRoomStore((room) => room.state.wallpaperRepeats);

  return (
    <div {...props}>
      <Typography variant="h3" gutterBottom>
        {t('features.roomSettings.wallpapers.positionLabel')}
      </Typography>
      <RadioGroup
        value={repeats ? 'tiled' : 'centered'}
        onChange={(_, value) => client.roomState.setWallpaperRepeats(value === 'tiled')}
      >
        <FormControlLabel
          control={<Radio color="primary" value="centered" />}
          label={t('features.roomSettings.wallpapers.centered')}
        />
        <FormControlLabel
          control={<Radio color="primary" value="tiled" />}
          label={t('features.roomSettings.wallpapers.tiled')}
        />
      </RadioGroup>
    </div>
  );
}
