import * as React from 'react';
import { makeStyles, Paper } from '@material-ui/core';
import { DropdownIcon } from '../../../components/icons/DropdownIcon';
import { MembershipManagement } from '../membership/MembershipManagement';
import { InviteLink } from '../membership/InviteLink';
import { useTranslation } from 'react-i18next';
import { ResponsivePopover } from '../../../components/ResponsivePopover/ResponsivePopover';
import { useRoomStore } from '../../../roomState/useRoomStore';
import { ResponsiveIconButton } from '../../../components/ResponsiveIconButton/ResponsiveIconButton';
import { truncate } from '../../../utils/truncate';
import { RoomIcon } from '../../../components/icons/RoomIcon';
import { useRoomRoute } from '../../../hooks/useRoomRoute/useRoomRoute';
import useMergedRef from '@react-hook/merged-ref';
import clsx from 'clsx';

export interface IRoomMenuProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  largeMenu: {
    width: '100%',
    maxHeight: 360,
    minHeight: 190,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      width: 380,
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
export const RoomMenu = React.forwardRef<HTMLDivElement, IRoomMenuProps>(({ className, ...rest }, ref) => {
  const anchorRef = React.useRef<any>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const classes = useStyles();
  const { t } = useTranslation();
  const displayName = useRoomStore((room) => room.state.displayName);

  const openAndFocusInvite = React.useCallback(() => {
    setIsOpen(true);
  }, []);
  const onClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const roomRoute = useRoomRoute();

  const rootRef = useMergedRef(ref, anchorRef);

  if (!roomRoute) {
    throw new Error('MembersMenu must be rendered on a room page');
  }

  return (
    <Paper ref={rootRef} className={clsx(classes.root, className)} {...rest}>
      <ResponsiveIconButton
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
        <MembershipManagement roomRoute={roomRoute} autoFocusInvite={false} className={classes.largeMenu} />
        <InviteLink roomRoute={roomRoute} />
      </ResponsivePopover>
    </Paper>
  );
});
