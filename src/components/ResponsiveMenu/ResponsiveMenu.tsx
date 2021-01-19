import * as React from 'react';
import { useMediaQuery, Theme, Menu, SwipeableDrawer } from '@material-ui/core';

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
}

const noop = () => {};

/**
 * Renders a Menu on desktop and a Drawer on mobile
 */
export const ResponsiveMenu: React.FC<IResponsiveMenuProps> = ({ anchorEl, open, onClose, className, ...rest }) => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  if (isSmall) {
    return (
      <SwipeableDrawer
        disableSwipeToOpen
        onOpen={noop}
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{ className }}
        {...rest}
      />
    );
  }

  return <Menu anchorEl={anchorEl} open={open} onClose={onClose} className={className} {...rest} />;
};
