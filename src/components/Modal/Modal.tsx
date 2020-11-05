import React, { ReactNode } from 'react';
import { Dialog } from '@material-ui/core';

interface IModalProps {
  children?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Modal: React.FC<IModalProps> = ({ children, isOpen, onClose, maxWidth = 'md', fullWidth = true }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      {children}
    </Dialog>
  );
};
