import * as React from 'react';
import { makeStyles, Divider, Button, Box } from '@material-ui/core';
import { RoomWallpaperMenuItem } from './RoomWallpaperMenuItem';
import { ChangelogButton } from './ChangelogMenuItem';
import { useTranslation } from 'react-i18next';
import { Links } from '../../../../constants/Links';
import { LeaveRoomMenuItem } from './LeaveRoomMenuItem';
import { UserSettingsMenuItem } from './UserSettingsMenuItem';
import { LogoIcon } from '../../../../components/icons/LogoIcon';
import { SquareIconButton } from '../../../../components/SquareIconButton/SquareIconButton';
import { ResponsivePopover } from '../../../../components/ResponsivePopover/ResponsivePopover';
import { Spacing } from '../../../../components/Spacing/Spacing';
import { Link } from '../../../../components/Link/Link';
import { BugReport } from './BugReport';
import { AvatarSelectorBubble } from '../../avatar/AvatarSelectorBubble';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  button: {
    color: theme.palette.brandColors.cherry.bold,
    position: 'relative',
  },
  menu: {
    [theme.breakpoints.up('md')]: {
      transform: `translateX(-4px)`,
    },
  },
  avatarBox: {
    backgroundColor: theme.palette.brandColors.sand.regular,
  },
  avatar: {
    cursor: 'pointer',
  },
  updateBadge: {
    position: 'absolute',
    right: 2,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: '100%',
    backgroundColor: theme.palette.brandColors.cherry.regular,
  },
  changelogButton: {
    height: 30,
    width: 30,
  },
  updatedChangelogButton: {
    color: theme.palette.brandColors.cherry.bold,
  },
}));

export const MainMenu = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const onClose = () => setAnchorEl(null);

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [isChangelogNew, setIsChangelogNew] = React.useState(false);

  // register changelog state every time this component mounts
  React.useEffect(() => {
    if (process.env.REACT_APP_CANNY_APP_ID) {
      Canny('initChangelog', {
        appID: process.env.REACT_APP_CANNY_APP_ID,
        position: 'top',
        align: 'left',
      });
      setTimeout(() => {
        // after a frame, check to see if the badge was added and set
        // changelog new flag
        if (!buttonRef.current) return;
        for (const child of buttonRef.current.children) {
          if (child.classList.contains('Canny_BadgeContainer')) {
            setIsChangelogNew(true);
          }
        }
      });
    }
  }, []);

  const onButtonClicked = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(ev.currentTarget);
    Canny('closeChangelog');
  };

  return (
    <>
      <SquareIconButton
        aria-label={t('features.roomMenu.title')}
        onClick={onButtonClicked}
        className={classes.button}
        aria-haspopup="true"
        aria-controls={!!anchorEl ? 'roomMenu' : undefined}
        // connects to the Canny initChangelog event
        data-canny-changelog
        ref={buttonRef}
      >
        <LogoIcon color="inherit" fontSize="default" />
      </SquareIconButton>
      <ResponsivePopover
        id="roomMenu"
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={onClose}
        className={classes.menu}
        marginThreshold={6}
      >
        <Box py={1}>
          <Box
            pt={5}
            pb={0.5}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-end"
            borderRadius={2}
            overflow="hidden"
            mb={1}
            className={classes.avatarBox}
          >
            <AvatarSelectorBubble className={classes.avatar} />
          </Box>
        </Box>
        <Box px={1.5}>
          <UserSettingsMenuItem onClick={onClose}>{t('features.roomMenu.userSettings')}</UserSettingsMenuItem>
          <RoomWallpaperMenuItem onClick={onClose}>{t('features.roomMenu.roomWallpaper')}</RoomWallpaperMenuItem>
          <Divider />
          <LeaveRoomMenuItem>{t('features.roomMenu.goToDashboard')}</LeaveRoomMenuItem>
          <Divider />
          <Spacing alignItems="center">
            <ChangelogButton className={clsx(isChangelogNew && classes.updatedChangelogButton)} />
            <BugReport />
            <Button
              size="small"
              color="inherit"
              variant="text"
              fullWidth={false}
              component={Link}
              disableStyling
              to={`${Links.FEEDBACK}/feedback`}
              newTab
            >
              {t('features.room.sendFeedbackBtn')}
            </Button>
          </Spacing>
        </Box>
      </ResponsivePopover>
    </>
  );
};
