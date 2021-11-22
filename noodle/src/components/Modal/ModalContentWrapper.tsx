import React from 'react';
import { DialogContent, Box, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

interface IModalContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  content: {
    flexDirection: 'row',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
}));

export const ModalContentWrapper: React.FC<IModalContentWrapperProps> = ({ children, className }) => {
  const styles = useStyles();
  return (
    <Box
      component={DialogContent}
      display="flex"
      flexGrow={1}
      flexBasis={'auto'}
      justifyContent="center"
      alignItems="center"
      className={clsx(styles.content, className)}
    >
      {children}
    </Box>
  );
};
