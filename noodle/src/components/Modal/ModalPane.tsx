import React from 'react';
import clsx from 'clsx';
import { makeStyles, Box } from '@material-ui/core';

interface IModalPaneProps {
  children?: React.ReactNode;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  modalPane: {
    overflowY: 'auto',
    width: 340,
    maxWidth: '100%',
    height: 340,
    maxHeight: '100%',

    '& + &': {
      marginLeft: theme.spacing(2),

      [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(2),
        marginLeft: 0,
      },
    },
  },
}));

export const ModalPane: React.FC<IModalPaneProps> = ({ children, className }) => {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      flexShrink={1}
      flexBasis={'auto'}
      className={clsx(classes.modalPane, className)}
    >
      {children}
    </Box>
  );
};
