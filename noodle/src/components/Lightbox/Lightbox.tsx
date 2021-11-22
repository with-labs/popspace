import * as React from 'react';
import { Modal, makeStyles, ModalProps } from '@material-ui/core';
import clsx from 'clsx';

export interface ILightboxProps extends ModalProps {
  open: boolean;
  onClose?: () => void;
  onClick?: () => void;
  contentClassName?: string;
}

const useStyles = makeStyles((theme) => ({
  backdrop: {
    // backgroundColor: 'rgba(58%, 61.2%, 72.9%, 0.4) !important',
    backgroundColor: `${theme.palette.brandColors.ink.regular} !important`,
  },
  modal: {
    display: 'flex',
  },
  content: {
    margin: 'auto',
    maxWidth: '98vw',
    maxHeight: '98vh',
    display: 'flex',
  },
}));

export const Lightbox: React.FC<ILightboxProps> = ({
  open,
  onClose,
  children,
  onClick,
  className,
  contentClassName,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={clsx(classes.modal, className)}
      BackdropProps={{ className: classes.backdrop }}
      {...rest}
    >
      <div className={clsx(classes.content, contentClassName)} onClick={onClick}>
        {children}
      </div>
    </Modal>
  );
};
