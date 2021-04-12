import * as React from 'react';
import { makeStyles, Divider, Button, Box } from '@material-ui/core';
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
import { useUpdateStore } from '../../../updates/useUpdatesStore';
import shallow from 'zustand/shallow';
import { Refresh } from '@material-ui/icons';
import clsx from 'clsx';
import { useAnalytics, includeData } from '../../../../hooks/useAnalytics/useAnalytics';
import { EventNames } from '../../../../analytics/constants';

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
  buttonUpdate: {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      zIndex: 1,
      top: 4,
      right: 2,
      width: 8,
      height: 8,
      borderRadius: '100%',
      backgroundColor: theme.palette.brandColors.cherry.light,
    },
  },
}));

export const MainMenu = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics([includeData.roomId]);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const onClose = () => setAnchorEl(null);

  const [hasUpdate, acceptUpdate] = useUpdateStore((s) => [s.hasUpdate, s.api.onUpdate], shallow);

  const onButtonClicked = (ev: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent(EventNames.MAIN_MENU_CLICKED);
    setAnchorEl(ev.currentTarget);
  };

  return (
    <>
      <SquareIconButton
        aria-label={t('features.roomMenu.title')}
        onClick={onButtonClicked}
        className={clsx(classes.button, hasUpdate && classes.buttonUpdate)}
        aria-haspopup="true"
        aria-controls={!!anchorEl ? 'roomMenu' : undefined}
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
          <Divider />
          <LeaveRoomMenuItem>{t('features.roomMenu.goToDashboard')}</LeaveRoomMenuItem>
          <Divider />
          <Spacing alignItems="center">
            <ChangelogButton />
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
          {hasUpdate && (
            <Box pt={2} pb={1}>
              <Button endIcon={<Refresh />} onClick={acceptUpdate}>
                {t('features.updates.title')}
              </Button>
            </Box>
          )}
        </Box>
      </ResponsivePopover>
    </>
  );
};
