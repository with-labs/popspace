import * as React from 'react';
import {
  Button,
  Menu,
  makeStyles,
  Divider,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@material-ui/core';
import { DropdownIcon } from '../../../components/icons/DropdownIcon';
import { RoomWallpaperMenuItem } from './RoomWallpaperMenuItem';
import { ManageMembershipMenuItem } from './ManageMembershipMenuItem';
import { useRoomName } from '../../../hooks/useRoomName/useRoomName';
import { FeedbackIcon } from '../../../components/icons/FeedbackIcon';
import { EmailIcon } from '../../../components/icons/EmailIcon';
import { useTranslation } from 'react-i18next';
import { Link } from '../../../components/Link/Link';
import { Links } from '../../../constants/Links';
import { USER_SUPPORT_EMAIL } from '../../../constants/User';
import { LeaveRoomMenuItem } from './LeaveRoomMenuItem';

const useStyles = makeStyles((theme) => ({
  button: {
    height: 40,
  },
}));

export const RoomMenu = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const onClose = () => setAnchorEl(null);

  const roomName = useRoomName();

  return (
    <>
      <Button
        variant="text"
        endIcon={<DropdownIcon />}
        onClick={(ev) => setAnchorEl(ev.currentTarget)}
        color="inherit"
        className={classes.button}
      >
        {roomName || 'Room'}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
        {/* TODO: User Settings item here */}
        <RoomWallpaperMenuItem onClick={onClose}>{t('features.roomMenu.roomWallpaper')}</RoomWallpaperMenuItem>
        <Divider />
        {/* hide this option until we want to have it out there */}
        {/* <ListSubheader>{t('features.roomMenu.roomMembersTitle')}</ListSubheader>
        <ManageMembershipMenuItem onClick={onClose}>{t('features.roomMenu.addAndManage')}</ManageMembershipMenuItem>
        <Divider /> */}
        <Link to={Links.FEEDBACK} disableStyling>
          <MenuItem>
            <ListItemIcon>
              <FeedbackIcon />
            </ListItemIcon>
            <ListItemText primary={t('features.roomMenu.voteOnFeatures')} />
          </MenuItem>
        </Link>
        <Link to={`mailto:${USER_SUPPORT_EMAIL}`} disableStyling>
          <MenuItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText primary={t('features.roomMenu.contactUs')} />
          </MenuItem>
        </Link>
        <LeaveRoomMenuItem>{t('features.roomMenu.goToDashboard')}</LeaveRoomMenuItem>
        <Divider />
        <Link to={Links.TOS} disableStyling>
          <MenuItem dense>
            <ListItemText primary={t('header.tos')} />
          </MenuItem>
        </Link>
        <Link to={Links.PRIVACY_POLICY} disableStyling>
          <MenuItem dense>
            <ListItemText primary={t('header.privacyPolicy')} />
          </MenuItem>
        </Link>
      </Menu>
    </>
  );
};
