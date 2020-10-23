import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, makeStyles, Typography, IconButton } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as roomSelectors, actions as roomActions, actions } from '../roomSlice';
import { useCoordinatedDispatch } from '../CoordinatedDispatchProvider';
import { WallpaperGrid } from './WallpaperGrid';
import { CustomWallpaperForm } from './CustomWallpaperForm';
import { BUILT_IN_WALLPAPERS } from '../../../constants/wallpapers';
import { CloseIcon } from '../../../withComponents/icons/CloseIcon';

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    display: 'flex',
    flexDirection: 'row',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  content: {
    overflowY: 'auto',
    width: 340,
    height: 340,
    '& + &': {
      marginLeft: theme.spacing(2),
    },

    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
      marginLeft: 'auto',
    },
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

export const WallpaperModal = () => {
  const classes = useStyles();

  const isOpen = useSelector(roomSelectors.selectIsWallpaperModalOpen);

  const wallpaperUrl = useSelector(roomSelectors.selectWallpaperUrl);

  const dispatch = useDispatch();
  const coordinatedDispatch = useCoordinatedDispatch();
  const setWallpaper = React.useCallback(
    (url: string) => {
      coordinatedDispatch(actions.updateRoomWallpaper({ wallpaperUrl: url }));
    },
    [coordinatedDispatch]
  );

  const onClose = () => dispatch(roomActions.setIsWallpaperModalOpen({ isOpen: false }));

  // separate built-in from custom values
  const builtinWallpaperUrl = BUILT_IN_WALLPAPERS.includes(wallpaperUrl) ? wallpaperUrl : null;
  const customWallpaperUrl = builtinWallpaperUrl ? null : wallpaperUrl;

  return (
    <Dialog maxWidth="md" fullWidth open={isOpen} onClose={onClose}>
      <DialogTitle>
        <Typography variant="h6">Room wallpaper</Typography>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.contentContainer}>
        <div className={classes.content}>
          <WallpaperGrid onChange={setWallpaper} value={builtinWallpaperUrl} />
        </div>
        <div className={classes.content}>
          <CustomWallpaperForm value={customWallpaperUrl} onChange={setWallpaper} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
