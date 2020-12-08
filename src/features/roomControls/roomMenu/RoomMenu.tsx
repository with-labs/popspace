import * as React from 'react';
import { makeStyles, Divider, MenuItem, ListItemIcon, ListItemText, Box, IconButton } from '@material-ui/core';
import { RoomWallpaperMenuItem } from './RoomWallpaperMenuItem';
import { ChangelogMenuItem } from './ChangelogMenuItem';
import { FeedbackIcon } from '../../../components/icons/FeedbackIcon';
import { EmailIcon } from '../../../components/icons/EmailIcon';
import { useTranslation } from 'react-i18next';
import { Link } from '../../../components/Link/Link';
import { Links } from '../../../constants/Links';
import { USER_SUPPORT_EMAIL } from '../../../constants/User';
import { LeaveRoomMenuItem } from './LeaveRoomMenuItem';
import { UserSettingsMenuItem } from './UserSettingsMenuItem';
import { HamburgerIcon } from '../../../components/icons/HamburgerIcon';
import { ResponsiveMenu } from '../../../components/ResponsiveMenu/ResponsiveMenu';
import { RouteNames } from '../../../constants/RouteNames';

const useStyles = makeStyles((theme) => ({
  button: {
    marginRight: theme.spacing(1),
  },
}));

export const RoomMenu = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const onClose = () => setAnchorEl(null);

  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <IconButton
        aria-label={t('features.roomMenu.title')}
        onClick={(ev) => setAnchorEl(ev.currentTarget)}
        color="inherit"
        className={classes.button}
      >
        <HamburgerIcon />
      </IconButton>
      <ResponsiveMenu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
        <UserSettingsMenuItem onClick={onClose}>{t('features.roomMenu.userSettings')}</UserSettingsMenuItem>
        <RoomWallpaperMenuItem onClick={onClose}>{t('features.roomMenu.roomWallpaper')}</RoomWallpaperMenuItem>
        <Divider />
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
        <ChangelogMenuItem onClick={onClose}>{t('features.roomMenu.changelog')}</ChangelogMenuItem>
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
        <Link to={RouteNames.LICENSES} disableStyling>
          <MenuItem dense>
            <ListItemText primary={t('features.roomMenu.licenses')} />
          </MenuItem>
        </Link>
      </ResponsiveMenu>
    </Box>
  );
};
