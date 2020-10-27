import React from 'react';
import { DialogContent, Box, makeStyles } from '@material-ui/core';

interface IModalContentWrapperProps {
  children: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  content: {
    display: 'flex',
    flexDirection: 'row',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
}));

export const ModalContentWrapper: React.FC<IModalContentWrapperProps> = ({ children }) => {
  const styles = useStyles();
  return (
    <Box
      component={DialogContent}
      display="flex"
      flexGrow={1}
      flexBasis={'auto'}
      justifyContent="center"
      alignItems="center"
      className={styles.content}
    >
      {children}
    </Box>
  );
};
