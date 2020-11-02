import React, { ReactNode } from 'react';
import { DialogActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';

interface IModalActionsProps {
  children?: ReactNode;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  modalActions: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const ModalActions: React.FC<IModalActionsProps> = ({ children, className }) => {
  const classes = useStyles();

  return <DialogActions className={classes.modalActions}>{children}</DialogActions>;
};
