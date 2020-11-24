import * as React from 'react';
import { useCurrentUserProfile } from '../../../hooks/useCurrentUserProfile/useCurrentUserProfile';
import { useRoomName } from '../../../hooks/useRoomName/useRoomName';
import { Menu, IconButton } from '@material-ui/core';
import { InviteIcon } from '../../../components/icons/InviteIcon';
import { DropdownIcon } from '../../../components/icons/DropdownIcon';
import { MembershipManagement } from './MembershipManagement';

export interface IMembersMenuProps {}

/**
 * Renders the members dropdown menu and the grouping of controls which
 * trigger / interact with it
 */
export const MembersMenu = React.forwardRef<HTMLDivElement, IMembersMenuProps>((_, ref) => {
  const anchorRef = React.useRef<any>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [autoFocusInvite, setAutoFocusInvite] = React.useState(false);

  const roomName = useRoomName();
  const { currentUserProfile } = useCurrentUserProfile();
  const isRoomOwner = React.useMemo(() => currentUserProfile?.rooms?.owned.some((room) => room.name === roomName), [
    currentUserProfile,
    roomName,
  ]);

  const onOpen = React.useCallback(() => {
    setIsOpen(true);
  }, []);
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
      {/* TODO: public member list of avatars */}
      {isRoomOwner && (
        <>
          <IconButton onClick={openAndFocusInvite}>
            <InviteIcon />
          </IconButton>
          <IconButton ref={anchorRef} onClick={onOpen}>
            <DropdownIcon />
          </IconButton>
          <Menu anchorEl={anchorRef.current} open={isOpen} onClose={onClose}>
            <MembershipManagement autoFocusInvite={autoFocusInvite} />
          </Menu>
        </>
      )}
    </div>
  );
});
