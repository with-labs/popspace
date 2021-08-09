import * as React from 'react';
import { makeStyles, ButtonBase, Typography, Tooltip, Box } from '@material-ui/core';
import { IWallpaper } from './WallpaperOptions';
import clsx from 'clsx';

export interface IWallpaperGridProps {
  onChange: (wallpaperUrl: string, isCustomWallpaper: boolean) => void;
  value: string | null;
  wallpaperList: IWallpaper[];
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gridAutoRows: '1fr',
    gridGap: theme.spacing(2),
    padding: theme.spacing(0.5),

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
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

export const WallpaperGrid: React.FC<IWallpaperGridProps> = ({ wallpaperList, onChange, value }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {wallpaperList.map((wallpaper, idx) => (
        <div key={wallpaper.url}>
          <Tooltip
            classes={{ tooltip: classes.toolTip }}
            enterDelay={100}
            interactive={true}
            title={
              <Box display="flex" flexDirection="column">
                <Typography variant="body1">{wallpaper.name}</Typography>
                <Typography variant="body2">
                  <Box component="span" fontWeight="fontWeightBold">
                    {wallpaper.artistName}
                  </Box>
                </Typography>
              </Box>
            }
          >
            <ButtonBase
              onClick={() => onChange(wallpaper.url, false)}
              className={clsx(classes.item, wallpaper.url === value && classes.itemSelected)}
              aria-label={wallpaper.name}
            >
              <img className={classes.image} src={wallpaper.thumbnailUrl} alt={wallpaper.name} />
            </ButtonBase>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};
