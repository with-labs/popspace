import {
  Box,
  makeStyles,
  ModalProps,
  Popover,
  PopoverOrigin,
  PopoverPosition,
  PopoverProps,
  SwipeableDrawer,
  Theme,
  useMediaQuery,
} from '@material-ui/core';
import * as React from 'react';

export interface IResponsivePopoverProps extends Omit<ModalProps, 'children'> {
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
  /**
   * Allows full interaction with the rest of the page
   * while the popover is open
   */
  disableBlockBackground?: boolean;
  action?: PopoverProps['action'];
}

const ResponsivePopoverContext = React.createContext<'top' | 'bottom' | 'left' | 'right'>('bottom');

export const ResponsivePopoverProvider = ResponsivePopoverContext.Provider;

export const useResponsivePopoverPlacement = () => React.useContext(ResponsivePopoverContext);

const noop = () => {};

const anchorOrigins = {
  right: { horizontal: 54, vertical: 'top' },
  top: { horizontal: 'left', vertical: 'bottom' },
  bottom: { horizontal: 'left', vertical: 'bottom' },
  left: { horizontal: -54, vertical: 'top' },
} as const;

const transformOrigins = {
  right: { horizontal: 'left', vertical: 8 },
  top: { horizontal: 8, vertical: -8 },
  bottom: { horizontal: 8, vertical: -8 },
  left: { horizontal: 'right', vertical: 8 },
} as const;

const useStyles = makeStyles(() => ({
  disableBlockBackground: {
    pointerEvents: 'none',
    '& > *': {
      pointerEvents: 'initial',
    },
  },
}));

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
  disableBlockBackground,
  action,
  ...rest
}) => {
  const classes = useStyles();
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const placement = useResponsivePopoverPlacement();

  const additionalProps = disableBlockBackground
    ? {
        className: classes.disableBlockBackground,
        disableScrollLock: true,
        disableRestoreFocus: true,
        disableEnforceFocus: true,
        disableAutoFocus: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        hideBackdrop: true,
      }
    : {};

  if (isSmall) {
    return (
      <SwipeableDrawer
        disableSwipeToOpen
        onOpen={noop}
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{ className }}
        ModalProps={additionalProps}
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
      transformOrigin={transformOrigin || transformOrigins[placement]}
      anchorPosition={anchorPosition}
      anchorOrigin={anchorOrigin || anchorOrigins[placement]}
      marginThreshold={marginThreshold}
      PaperProps={{ className }}
      action={action}
      {...additionalProps}
      {...rest}
    >
      <Box p={2} data-no-drag>
        {children}
      </Box>
    </Popover>
  );
};
