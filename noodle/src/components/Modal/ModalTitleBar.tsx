import React from 'react';
import { DialogTitle, makeStyles, Typography, IconButton, Box } from '@material-ui/core';
import { CloseIcon } from '@components/icons/CloseIcon';
import { BackIcon } from '@components/icons/BackIcon';

interface WidgetTitlebarProps {
  title: string;
  onClose?: () => void;
  onBack?: (() => void) | null;
}

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
}));

export const ModalTitleBar: React.FC<WidgetTitlebarProps> = ({ title, onClose, onBack }) => {
  const classes = useStyles();

  return (
    <DialogTitle disableTypography>
      <Box display="flex" flexDirection="row" alignItems="center">
        {onBack ? (
          <IconButton onClick={onBack}>
            <BackIcon />
          </IconButton>
        ) : null}
        <Typography variant="h2" className={classes.title}>
          {title}
        </Typography>
        {onClose ? (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </Box>
    </DialogTitle>
  );
};
