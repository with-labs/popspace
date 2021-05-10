import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  makeStyles,
  Box,
  IconButton,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from '@material-ui/core';
import { RoomInfo } from '../../../types/api';
import { OptionsIcon } from '../../../components/icons/OptionsIcon';
import { DeleteIcon } from '../../../components/icons/DeleteIcon';
import { InviteIcon } from '../../../components/icons/InviteIcon';
import { EditIcon } from '../../../components/icons/EditIcon';
import { ResponsiveMenu } from '../../../components/ResponsiveMenu/ResponsiveMenu';
import { useCurrentUserProfile } from '../../../hooks/api/useCurrentUserProfile';
import { useTranslation } from 'react-i18next';
import { isChrome, isIOS } from 'react-device-detect';
import { Star } from '@material-ui/icons';
import { useDefaultRoom } from '../../../hooks/api/useDefaultRoom';
import clsx from 'clsx';
import { ApiNamedRoom } from '../../../utils/api';

interface IRoomSummaryProps {
  roomInfo: RoomInfo;
  onInvite: (roomInfo: RoomInfo) => void;
  onRename: (roomInfo: RoomInfo) => void;
  onDelete: (roomInfo: RoomInfo) => void;
  onErrorHandler: (errorMsg: string) => void;
  isActive: boolean;
  onRoomSelected: (roomInfo: ApiNamedRoom) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    cursor: 'pointer',
    backgroundColor: theme.palette.brandColors.snow.regular,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.brandColors.slate.light}`,
    boxShadow: theme.mainShadows.surface,
    padding: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      maxWidth: 236,
      maxHeight: 172,
      justifySelf: 'center',
    },
  },
  titleWrapper: {
    marginTop: theme.spacing(1),
  },
  title: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    height: '100%',
    fontWeight: 600,
  },
  wallpaper: {
    height: 110,
    minWidth: 204,
    width: '100%',
    justifyContent: 'center',
    backgroundSize: 'cover',
    borderRadius: theme.shape.contentBorderRadius,
    alignSelf: 'center',
  },
  deleteColor: {
    color: theme.palette.brandColors.cherry.bold,
  },
  owner: {
    color: theme.palette.brandColors.oregano.bold,
  },
  guest: {
    color: theme.palette.brandColors.slate.bold,
  },
  selected: {
    boxShadow: `0 0 0 4px ${theme.palette.brandColors.lavender.bold}`,
  },
  notSelected: {
    '&:focus, &:hover': {
      boxShadow: `0 0 0 4px ${theme.palette.grey[500]}`,
    },
  },
}));

export const RoomSummary: React.FC<IRoomSummaryProps> = (props) => {
  const classes = useStyles();
  const { roomInfo, onInvite, onRename, onDelete, onErrorHandler, isActive = false, onRoomSelected } = props;
  const { t } = useTranslation();
  const anchorRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useCurrentUserProfile();
  const history = useHistory();

  const isOwner = roomInfo.owner_id === user?.id;

  const onRoomClickHandler = () => {
    if (isIOS && isChrome) {
      // webrtc doesnt work on chrome + ios, so tell them to use safari
      onErrorHandler(t('error.messages.chromeOnIosRestrictions'));
    } else if (isOpen) {
      // close the menu if its open
      setIsOpen(false);
    } else {
      onRoomSelected(roomInfo);
      // got to the room
      history.replace(`/${roomInfo.route}?join`);
    }
  };

  const onMenuClicked = (event: React.MouseEvent | React.PointerEvent) => {
    event.stopPropagation();
    setIsOpen(true);
  };

  const { data: defaultRoomRoute, update: setDefaultRoom } = useDefaultRoom();

  const isDefault = roomInfo.route === defaultRoomRoute;

  // Note: boxes should be able to take a ref as
  // per https://github.com/mui-org/material-ui/issues/17010
  // but our current version of mui doesnt have this definition in it
  // yet, this is a work around until we are able to pull down the correct version.
  return (
    <Box
      display="flex"
      flexDirection="column"
      className={clsx(classes.root, {
        [classes.selected]: isActive,
        [classes.notSelected]: !isActive,
      })}
      tabIndex={0}
      onClick={onRoomClickHandler}
      role="button"
    >
      <Box
        className={classes.wallpaper}
        display="flex"
        flexBasis="auto"
        flexGrow="1"
        flexShrink="1"
        style={{ backgroundImage: `url(${roomInfo.preview_image_url})` }}
      ></Box>
      <Box display="flex" flexDirection="row" className={classes.titleWrapper}>
        <Box display="flex" flex="1" flexDirection="column" className={classes.title}>
          <Box flex="1" display="flex" flexDirection="row" alignItems="center">
            <Typography className={classes.title} variant="body1">
              {roomInfo.display_name}
            </Typography>
            {isDefault && (
              <Tooltip title={t('pages.preroom.roomSummary.defaultRoom') as string}>
                <Star style={{ marginLeft: 8 }} fontSize="default" color="primary" />
              </Tooltip>
            )}
          </Box>
          <Box className={isOwner ? classes.owner : classes.guest}>
            <Typography variant="h4">
              {isOwner ? t('pages.preroom.roomSummary.owner') : t('pages.preroom.roomSummary.guest')}
            </Typography>
          </Box>
        </Box>
        <IconButton ref={anchorRef} onClick={onMenuClicked}>
          <OptionsIcon />
        </IconButton>
      </Box>
      <ResponsiveMenu
        anchorEl={anchorRef.current}
        open={isOpen}
        onClick={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      >
        <MenuItem onClick={() => onInvite(roomInfo)}>
          <ListItemIcon>
            <InviteIcon />
          </ListItemIcon>
          <ListItemText primary={t('pages.preroom.roomSummary.inviteMembers')} />
        </MenuItem>
        {!isDefault && (
          <MenuItem onClick={() => setDefaultRoom(roomInfo.route)}>
            <ListItemIcon>
              <Star />
            </ListItemIcon>
            <ListItemText primary={t('pages.preroom.roomSummary.makeDefault')} />
          </MenuItem>
        )}
        {isOwner && [
          <MenuItem key={'rename-room-menuItem'} onClick={() => onRename(roomInfo)}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary={t('pages.preroom.roomSummary.renameRoom')} />
          </MenuItem>,
          <Divider key={'divider-menuItem'} />,
          <MenuItem key={'delete-room-menuItem'} onClick={() => onDelete(roomInfo)}>
            <ListItemIcon>
              <DeleteIcon className={classes.deleteColor} />
            </ListItemIcon>
            <ListItemText primary={t('pages.preroom.roomSummary.deleteRoom')} className={classes.deleteColor} />
          </MenuItem>,
        ]}
      </ResponsiveMenu>
    </Box>
  );
};
