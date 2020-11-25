import * as React from 'react';
import { useMediaQuery, Theme, Drawer, Menu } from '@material-ui/core';

export interface IResponsiveMenuProps {
  anchorEl?: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Renders a Menu on desktop and a Drawer on mobile
 */
export const ResponsiveMenu: React.FC<IResponsiveMenuProps> = ({ anchorEl, open, onClose, className, ...rest }) => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  if (isSmall) {
    return <Drawer anchor="bottom" open={open} onClose={onClose} PaperProps={{ className }} {...rest} />;
  }

  return <Menu anchorEl={anchorEl} open={open} onClose={onClose} className={className} {...rest} />;
};
