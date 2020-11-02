import React, { ReactNode } from 'react';
import { Dialog } from '@material-ui/core';

interface IModalProps {
  children?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<IModalProps> = ({ children, isOpen, onClose, maxWidth = 'md' }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={maxWidth} fullWidth>
      {children}
    </Dialog>
  );
};
