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
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: '1fr',
    gridGap: theme.spacing(1),
    padding: theme.spacing(0.5),
  },
  item: {
    borderRadius: 6,
    overflow: 'hidden',

    transition: theme.transitions.create('box-shadow'),

    '&:focus:not($itemSelected)': {
      boxShadow: `0 0 0 4px ${theme.palette.secondary.main}`,
    },
  },
  itemSelected: {
    boxShadow: `0 0 0 4px ${theme.palette.secondary.dark}`,
  },
  image: {
    width: '100%',
    height: '100%',
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
