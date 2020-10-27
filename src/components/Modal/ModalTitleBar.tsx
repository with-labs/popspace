import React from 'react';
import clsx from 'clsx';
import { DialogTitle, makeStyles, Typography, IconButton } from '@material-ui/core';
import { CloseIcon } from '../../components/icons/CloseIcon';

interface WidgetTitlebarProps {
  title: string;
  className?: string;
  onClose?: () => void;
}

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
}));

export const ModalTitleBar: React.FC<WidgetTitlebarProps> = ({ title, className, onClose }) => {
  const classes = useStyles();

  return (
    <DialogTitle>
      <Typography variant="h6">{title}</Typography>
      {onClose ? (
        <IconButton className={clsx(classes.closeButton, className)} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};
