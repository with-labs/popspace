import * as React from 'react';
import { IconButton, Hidden } from '@material-ui/core';
import { InviteIcon } from '../../../components/icons/InviteIcon';
import { DropdownIcon } from '../../../components/icons/DropdownIcon';
import { MembershipManagement } from './MembershipManagement';
import { useIsRoomOwner } from '../../../hooks/useIsRoomOwner/useIsRoomOwner';
import { ResponsiveMenu } from '../../../components/ResponsiveMenu/ResponsiveMenu';

export interface IMembersMenuProps {}

/**
 * Renders the members dropdown menu and the grouping of controls which
 * trigger / interact with it
 */
export const MembersMenu = React.forwardRef<HTMLDivElement, IMembersMenuProps>((_, ref) => {
  const anchorRef = React.useRef<any>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [autoFocusInvite, setAutoFocusInvite] = React.useState(false);

  const isRoomOwner = useIsRoomOwner();

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
          <Hidden smDown>
            <IconButton ref={anchorRef} onClick={onOpen}>
              <DropdownIcon />
            </IconButton>
          </Hidden>
          <ResponsiveMenu anchorEl={anchorRef.current} open={isOpen} onClose={onClose}>
            <MembershipManagement autoFocusInvite={autoFocusInvite} />
          </ResponsiveMenu>
        </>
      )}
    </div>
  );
});
