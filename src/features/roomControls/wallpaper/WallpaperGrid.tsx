import * as React from 'react';
import { makeStyles, ButtonBase } from '@material-ui/core';
import { BUILT_IN_WALLPAPERS } from '../../../constants/wallpapers';
import clsx from 'clsx';

export interface IWallpaperGridProps {
  onChange: (wallpaperUrl: string) => void;
  value: string | null;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridAutoRows: '1fr',
    gridGap: theme.spacing(2),
    padding: theme.spacing(0.5),
  },
  item: {
    borderRadius: theme.shape.contentBorderRadius,
    overflow: 'hidden',

    transition: theme.transitions.create(['box-shadow', 'padding']),

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
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.shape.contentBorderRadius,
  },
}));

export const WallpaperGrid: React.FC<IWallpaperGridProps> = ({ onChange, value }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {BUILT_IN_WALLPAPERS.map((url, idx) => (
        <ButtonBase
          key={url}
          onClick={() => onChange(url)}
          className={clsx(classes.item, url === value && classes.itemSelected)}
          aria-label={`Default wallpaper ${idx + 1}`}
        >
          <img className={classes.image} src={url} alt={`Default wallpaper ${idx + 1}`} />
        </ButtonBase>
      ))}
    </div>
  );
};
