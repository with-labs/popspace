import * as React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { DropdownIcon } from '../../../components/icons/DropdownIcon';
import { MembershipManagement } from './MembershipManagement';
import { InviteLink } from '../InviteLink/InviteLink';
import { useFeatureFlag } from 'flagg';
import { useTranslation } from 'react-i18next';
import { ResponsivePopover } from '../../../components/ResponsivePopover/ResponsivePopover';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { ResponsiveIconButton } from '../../../components/ResponsiveIconButton/ResponsiveIconButton';
import { truncate } from '../../../utils/truncate';
import { RoomIcon } from '../../../components/icons/RoomIcon';

export interface IMembersMenuProps {}

const useStyles = makeStyles((theme) => ({
  largeMenu: {
    width: '100%',
    maxHeight: 360,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      width: 360,
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  button: {
    paddingTop: 8,
    paddingBottom: 8,
    maxWidth: 240,
    whiteSpace: 'nowrap',
  },
}));

/**
 * Renders the members dropdown menu and the grouping of controls which
 * trigger / interact with it
 */
export const MembersMenu = React.forwardRef<HTMLDivElement, IMembersMenuProps>((_, ref) => {
  const anchorRef = React.useRef<any>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [autoFocusInvite, setAutoFocusInvite] = React.useState(false);
  const classes = useStyles();
  const { t } = useTranslation();
  const displayName = useRoomStore((room) => room.state.displayName);

  const [hasInviteLink] = useFeatureFlag('inviteLink');

  const openAndFocusInvite = React.useCallback(() => {
    setIsOpen(true);
    setAutoFocusInvite(true);
  }, []);
  const onClose = React.useCallback(() => {
    setIsOpen(false);
    setAutoFocusInvite(false);
  }, []);

  return (
    <div ref={ref}>
      <ResponsiveIconButton
        ref={anchorRef}
        variant="text"
        color="inherit"
        onClick={openAndFocusInvite}
        className={classes.button}
        startIcon={<RoomIcon fontSize="default" />}
        endIcon={<DropdownIcon fontSize="default" />}
        label={displayName}
      >
        {truncate(displayName || t('modals.inviteMemberModal.defaultRoomName'), 20)}
      </ResponsiveIconButton>
      <ResponsivePopover anchorEl={anchorRef.current} open={isOpen} onClose={onClose}>
        {hasInviteLink && (
          <div>
            <div className={classes.title}>
              <Typography variant="h3">{t('features.roomControls.linkInviteTitle')}</Typography>
            </div>
            <InviteLink />
          </div>
        )}
        <div>
          <div className={classes.title}>
            <Typography variant="h3">{t('features.roomControls.emailInviteTitle')}</Typography>
          </div>
          <MembershipManagement autoFocusInvite={autoFocusInvite} className={classes.largeMenu} />
        </div>
      </ResponsivePopover>
    </div>
  );
});
