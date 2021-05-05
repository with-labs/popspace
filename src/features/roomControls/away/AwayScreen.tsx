import { Box, makeStyles } from '@material-ui/core';
import * as React from 'react';

export interface IAwayScreenProps {
  children?: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.brandColors.dim.regular,
    zIndex: theme.zIndex.modal,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const AwayScreen: React.FC<IAwayScreenProps> = ({ children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root} position="fixed" left={0} top={0} bottom={0} right={0}>
      {children}
    </Box>
  );
};
