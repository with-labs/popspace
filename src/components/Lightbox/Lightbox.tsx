import * as React from 'react';
import { Modal, makeStyles, ModalProps } from '@material-ui/core';

export interface ILightboxProps extends ModalProps {
  open: boolean;
  onClose?: () => void;
  onClick?: () => void;
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
    maxHeight: '98vh',
  },
}));

export const Lightbox: React.FC<ILightboxProps> = ({ open, onClose, children, onClick, ...rest }) => {
  const classes = useStyles();

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={classes.modal}
      BackdropProps={{ className: classes.backdrop }}
      {...rest}
    >
      <div className={classes.content} onClick={onClick}>
        {children}
      </div>
    </Modal>
  );
};
