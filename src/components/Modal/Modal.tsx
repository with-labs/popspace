import React, { ReactNode } from 'react';
import { Dialog, useMediaQuery, Theme, SwipeableDrawer } from '@material-ui/core';

interface IModalProps {
  children?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const noop = () => {};

export const Modal: React.FC<IModalProps> = ({
  children,
  isOpen,
  onClose = noop,
  maxWidth = 'md',
  fullWidth = true,
}) => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  if (isSmall) {
    return (
      <SwipeableDrawer disableSwipeToOpen onOpen={noop} open={isOpen} onClose={onClose} anchor="bottom">
        {children}
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      {children}
    </Dialog>
  );
};
