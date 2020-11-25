import React, { ReactNode } from 'react';
import { Dialog, useMediaQuery, Theme, Drawer } from '@material-ui/core';

interface IModalProps {
  children?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Modal: React.FC<IModalProps> = ({ children, isOpen, onClose, maxWidth = 'md', fullWidth = true }) => {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  if (isSmall) {
    return (
      <Drawer open={isOpen} onClose={onClose} anchor="bottom">
        {children}
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      {children}
    </Dialog>
  );
};
