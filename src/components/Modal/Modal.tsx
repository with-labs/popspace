import React from 'react';
import { Dialog, useMediaQuery, Theme, SwipeableDrawer, DialogProps } from '@material-ui/core';

export interface IModalProps extends Omit<DialogProps, 'open' | 'onClose'> {
  isOpen: boolean;
  onClose?: () => void;
}

const noop = () => {};

export const Modal: React.FC<IModalProps> = ({ children, isOpen, onClose = noop, maxWidth = 'md', ...rest }) => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  if (isSmall) {
    return (
      <SwipeableDrawer disableSwipeToOpen onOpen={noop} open={isOpen} onClose={onClose} anchor="bottom">
        {children}
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={maxWidth} {...rest}>
      {children}
    </Dialog>
  );
};
