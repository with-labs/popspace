import { Button, ButtonProps, IconButton, Theme, useMediaQuery } from '@material-ui/core';
import * as React from 'react';

export interface IResponsiveIconButtonProps extends Omit<ButtonProps, 'size'> {
  label: string;
  breakpoint?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  size?: 'small' | 'medium';
}

/**
 * A button which converts to an icon button at a specific breakpoint.
 * At least one icon and label are required to ensure there's something to show in Icon mode and
 * that there is an aria-label.
 * Provide just `icon` to have no icon on the main button.
 */
export const ResponsiveIconButton = React.forwardRef<HTMLButtonElement, IResponsiveIconButtonProps>(
  ({ children, breakpoint = 'sm', icon, startIcon, endIcon, label, ...rest }, ref) => {
    const matchesBreakpoint = useMediaQuery<Theme>((theme) => theme.breakpoints.down(breakpoint));

    if (!matchesBreakpoint) {
      return (
        <Button {...rest} startIcon={startIcon} endIcon={endIcon} ref={ref}>
          {children}
        </Button>
      );
    }

    return (
      <IconButton {...rest} aria-label={label} ref={ref}>
        {icon || startIcon || endIcon}
      </IconButton>
    );
  }
);
