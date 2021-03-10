import * as React from 'react';
import { useMediaQuery, Theme, SwipeableDrawer, Popover, Box, PopoverOrigin, PopoverPosition } from '@material-ui/core';

export interface IResponsivePopoverProps {
  anchorEl?: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  className?: string;
  id?: string;
  /**
   * Listen for any bubbled click events within the menu - good
   * for closing the menu after a selection has been made
   */
  onClick?: (ev: React.MouseEvent) => void;
  transformOrigin?: PopoverOrigin;
  anchorOrigin?: PopoverOrigin;
  anchorPosition?: PopoverPosition;
  marginThreshold?: number;
}

const ResponsivePopoverContext = React.createContext<'top' | 'bottom' | 'left' | 'right'>('bottom');

export const ResponsivePopoverProvider = ResponsivePopoverContext.Provider;

export const useResponsivePopoverPlacement = () => React.useContext(ResponsivePopoverContext);

const noop = () => {};

const anchorOrigins = {
  right: { horizontal: 54, vertical: 'top' },
  top: { horizontal: 'left', vertical: -16 },
  bottom: { horizontal: 'left', vertical: 'bottom' },
  left: { horizontal: -54, vertical: 'top' },
} as const;

const transformOrigins = {
  right: { horizontal: 'left', vertical: 8 },
  top: { horizontal: 8, vertical: 'bottom' },
  bottom: { horizontal: 8, vertical: -8 },
  left: { horizontal: 'right', vertical: 8 },
} as const;

/**
 * Renders a Popover on desktop and a Drawer on mobile
 */
export const ResponsivePopover: React.FC<IResponsivePopoverProps> = ({
  anchorEl,
  open,
  onClose,
  className,
  children,
  transformOrigin,
  anchorPosition,
  anchorOrigin,
  marginThreshold,
  ...rest
}) => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const placement = useResponsivePopoverPlacement();

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
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      className={className}
      transformOrigin={transformOrigin || transformOrigins[placement]}
      anchorPosition={anchorPosition}
      anchorOrigin={anchorOrigin || anchorOrigins[placement]}
      marginThreshold={marginThreshold}
      {...rest}
    >
      <Box p={2}>{children}</Box>
    </Popover>
  );
};
