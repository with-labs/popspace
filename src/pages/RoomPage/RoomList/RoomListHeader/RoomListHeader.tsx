import React from 'react';
import { Box, makeStyles, Button, Hidden, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { BackIcon } from '@components/icons/BackIcon';
import { Link } from '@components/Link/Link';
import { RouteNames } from '@constants/RouteNames';
import { Origin } from '@analytics/constants';
import clsx from 'clsx';

interface IRoomListHeaderProps {
  onClose?: () => void;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: `100%`,
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.brandColors.sand.regular,
    zIndex: 5,
    height: 80,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 15,
      paddingBottom: theme.spacing(1),
    },
  },
  backButton: {
    width: 100,
    padding: 15,
  },
  createRoomButton: {
    width: 146,
    padding: 15,
    marginLeft: 'auto',
  },
}));

export const RoomListHeader: React.FC<IRoomListHeaderProps> = ({ className, onClose }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={clsx(classes.root, className)} mb={2} display="flex" alignItems="center" justifyContent="center">
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        maxWidth="500px"
        width="100%"
      >
        {onClose && (
          <Hidden mdUp>
            <Button
              variant="text"
              color="inherit"
              startIcon={<BackIcon />}
              className={classes.backButton}
              onClick={onClose}
            >
              {t('common.back')}
            </Button>
          </Hidden>
        )}
        <Hidden smDown>
          <Typography variant="h2">{t('pages.preroom.roomTitle')}</Typography>
        </Hidden>
        <Button
          component={Link}
          disableStyling
          to={RouteNames.CREATE_ROOM}
          state={{ origin: Origin.CREATE_ROOM_BUTTON }}
          className={classes.createRoomButton}
        >
          {t('pages.preroom.createRoomButton')}
        </Button>
      </Box>
    </Box>
  );
};
