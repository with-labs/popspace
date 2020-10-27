import React, { ReactNode } from 'react';
import { Dialog } from '@material-ui/core';

interface IModalProps {
  children?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export const Modal: React.FC<IModalProps> = ({ children, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      {children}
    </Dialog>
  );
};
