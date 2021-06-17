import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveTooltip } from '@components/ResponsiveTooltip/ResponsiveTooltip';
import { useRoomStore } from '@api/useRoomStore';
import { useRoomModalStore } from '../useRoomModalStore';

export interface IWallpaperPickerProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  button: {
    width: 32,
    height: 32,
    borderRadius: theme.shape.contentBorderRadius,

    cursor: 'pointer',

    border: '1px solid rgba(0,0,0,0.1)',
    backgroundColor: theme.palette.brandColors.mandarin.light,
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    boxShadow: theme.focusRings.idle,

    '&:focus': {
      outline: 'none',
      boxShadow: theme.focusRings.primary,
    },
  },
  editHint: {
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

export const WallpaperPicker: React.FC<IWallpaperPickerProps> = ({ className, children, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const wallpaper = useRoomStore((room) => room.state.wallpaperUrl);
  const openModal = useRoomModalStore((store) => store.api.openModal);

  return (
    <ResponsiveTooltip title={t('features.roomMenu.roomWallpaper') as string}>
      <button
        style={{
          backgroundImage: `url(${wallpaper})`,
        }}
        onClick={() => openModal('settings')}
        className={classes.button}
      ></button>
    </ResponsiveTooltip>
  );
};
