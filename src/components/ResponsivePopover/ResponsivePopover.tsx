import * as React from 'react';
import { useMediaQuery, Theme, SwipeableDrawer, Popover, Box } from '@material-ui/core';

export interface IResponsivePopoverProps {
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
 * Renders a Popover on desktop and a Drawer on mobile
 */
export const ResponsivePopover: React.FC<IResponsivePopoverProps> = ({
  anchorEl,
  open,
  onClose,
  className,
  children,
  ...rest
}) => {
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
      >
        {children}
      </SwipeableDrawer>
    );
  }

  return (
    <Popover anchorEl={anchorEl} open={open} onClose={onClose} className={className} {...rest}>
      <Box p={2}>{children}</Box>
    </Popover>
  );
};
