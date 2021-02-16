import * as React from 'react';
import { makeStyles, Divider, ListItemText, IconButton } from '@material-ui/core';
import { RoomWallpaperMenuItem } from './RoomWallpaperMenuItem';
import { ChangelogMenuItem } from './ChangelogMenuItem';
import { useTranslation } from 'react-i18next';
import { Links } from '../../../constants/Links';
import { USER_SUPPORT_EMAIL } from '../../../constants/User';
import { LeaveRoomMenuItem } from './LeaveRoomMenuItem';
import { UserSettingsMenuItem } from './UserSettingsMenuItem';
import { HamburgerIcon } from '../../../components/icons/HamburgerIcon';
import { ResponsiveMenu } from '../../../components/ResponsiveMenu/ResponsiveMenu';
import { RouteNames } from '../../../constants/RouteNames';
import { LinkMenuItem } from '../../../components/LinkMenuItem/LinkMenuItem';

const useStyles = makeStyles((theme) => ({
  button: {},
  menu: {
    [theme.breakpoints.up('md')]: {
      transform: `translateX(-4px)`,
    },
  },
}));

export const RoomMenu = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const onClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        aria-label={t('features.roomMenu.title')}
        onClick={(ev) => setAnchorEl(ev.currentTarget)}
        color="inherit"
        className={classes.button}
        aria-haspopup="true"
        aria-controls={!!anchorEl ? 'roomMenu' : undefined}
      >
        <HamburgerIcon />
      </IconButton>
      <ResponsiveMenu id="roomMenu" anchorEl={anchorEl} open={!!anchorEl} onClose={onClose} className={classes.menu}>
        <UserSettingsMenuItem onClick={onClose}>{t('features.roomMenu.userSettings')}</UserSettingsMenuItem>
        <RoomWallpaperMenuItem onClick={onClose}>{t('features.roomMenu.roomWallpaper')}</RoomWallpaperMenuItem>
        <Divider />
        <LeaveRoomMenuItem>{t('features.roomMenu.goToDashboard')}</LeaveRoomMenuItem>
        <Divider />
        <LinkMenuItem dense to={`mailto:${USER_SUPPORT_EMAIL}`} disableStyling>
          <ListItemText primary={t('features.roomMenu.contactUs')} />
        </LinkMenuItem>
        <ChangelogMenuItem onClick={onClose}>{t('features.roomMenu.changelog')}</ChangelogMenuItem>
        <LinkMenuItem dense to={Links.TOS} disableStyling>
          <ListItemText primary={t('header.tos')} />
        </LinkMenuItem>
        <LinkMenuItem dense to={Links.PRIVACY_POLICY} disableStyling>
          <ListItemText primary={t('header.privacyPolicy')} />
        </LinkMenuItem>
        <LinkMenuItem dense to={RouteNames.LICENSES} disableStyling newTab>
          <ListItemText primary={t('features.roomMenu.licenses')} />
        </LinkMenuItem>
      </ResponsiveMenu>
    </>
  );
};
