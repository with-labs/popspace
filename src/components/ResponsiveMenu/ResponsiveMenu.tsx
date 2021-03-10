import * as React from 'react';
import { MenuList, PopoverOrigin, PopoverPosition } from '@material-ui/core';
import { ResponsivePopover } from '../ResponsivePopover/ResponsivePopover';

export interface IResponsiveMenuProps {
  anchorEl?: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  className?: string;
  /**
   * Listen for any bubbled click events within the menu - good
   * for closing the menu after a selection has been made
   */
  onClick?: (ev: React.MouseEvent) => void;
  id?: string;
  transformOrigin?: PopoverOrigin;
  anchorOrigin?: PopoverOrigin;
  anchorPosition?: PopoverPosition;
  marginThreshold?: number;
}

/**
 * Renders a Menu on desktop and a Drawer on mobile
 */
export const ResponsiveMenu: React.FC<IResponsiveMenuProps> = ({ children, onClose, ...rest }) => {
  const handleListKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  return (
    <ResponsivePopover onClose={onClose} {...rest}>
      <MenuList variant="menu" autoFocusItem={rest.open} onKeyDown={handleListKeyDown}>
        {children}
      </MenuList>
    </ResponsivePopover>
  );
};
