import * as React from 'react';
import { Box, Typography } from '@material-ui/core';
import { SharingOffIcon } from '../icons/SharingOffIcon';

export interface IScreenSharePlaceholderProps {
  className?: string;
  message?: React.ReactNode;
}

export const ScreenSharePlaceholder: React.FC<IScreenSharePlaceholderProps> = ({ className, message }) => {
  return (
    <Box
      color="grey.700"
      bgcolor="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      fontSize="5em"
      p={3}
      className={className}
    >
      <SharingOffIcon fontSize="inherit" color="inherit" />
      {message && <Typography style={{ marginTop: 16 }}>{message}</Typography>}
    </Box>
  );
};
