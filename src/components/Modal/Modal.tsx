import { Dialog, DialogProps, SwipeableDrawer, Theme, useMediaQuery } from '@material-ui/core';
import React from 'react';

export interface IModalProps extends Omit<DialogProps, 'open' | 'onClose'> {
  isOpen: boolean;
  onClose?: () => void;
  contentClassName?: string;
}

const noop = () => {};

export const Modal: React.FC<IModalProps> = ({
  children,
  isOpen,
  onClose = noop,
  maxWidth = 'md',
  className,
  contentClassName,
  PaperProps,
  ...rest
}) => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  if (isSmall) {
    return (
      <SwipeableDrawer
        disableSwipeToOpen
        onOpen={noop}
        open={isOpen}
        onClose={onClose}
        anchor="bottom"
        className={className}
        PaperProps={{
          ...PaperProps,
          className: contentClassName,
        }}
      >
        {children}
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      className={className}
      PaperProps={{ ...PaperProps, className: contentClassName }}
      {...rest}
    >
      {children}
    </Dialog>
  );
};
