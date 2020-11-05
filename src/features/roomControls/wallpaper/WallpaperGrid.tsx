import * as React from 'react';
import { makeStyles, ButtonBase, Typography } from '@material-ui/core';
import { wallPaperOptions } from './WallpaperOptions';
import clsx from 'clsx';
import { sentenceCase } from 'change-case';

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
  title: {
    marginTop: theme.spacing(1),
    textAlign: 'center',
  },
}));

export const WallpaperGrid: React.FC<IWallpaperGridProps> = ({ onChange, value }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {wallPaperOptions.map((wallpaper, idx) => (
        <div key={wallpaper.url}>
          <ButtonBase
            onClick={() => onChange(wallpaper.url)}
            className={clsx(classes.item, wallpaper.url === value && classes.itemSelected)}
            aria-label={wallpaper.name}
          >
            <img className={classes.image} src={wallpaper.url} alt={wallpaper.name} />
          </ButtonBase>
          <Typography variant="body2" className={classes.title}>
            {sentenceCase(wallpaper.name)}
          </Typography>
        </div>
      ))}
    </div>
  );
};
