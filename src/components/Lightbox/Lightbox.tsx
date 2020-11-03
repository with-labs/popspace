import * as React from 'react';
import { Modal, makeStyles } from '@material-ui/core';

export interface ILightboxProps {
  open: boolean;
  onClose?: () => void;
}

const useStyles = makeStyles(() => ({
  backdrop: {
    backgroundColor: 'rgba(191, 195, 215, 0.4)',
  },
  modal: {
    display: 'flex',
  },
  content: {
    margin: 'auto',
    maxWidth: '98vw',
  },
}));

export const Lightbox: React.FC<ILightboxProps> = ({ open, onClose, children }) => {
  const classes = useStyles();

  return (
    <Modal open={open} onClose={onClose} className={classes.modal} BackdropProps={{ className: classes.backdrop }}>
      <div className={classes.content}>{children}</div>
    </Modal>
  );
};
