import React from 'react';
import { Box } from '@material-ui/core';

interface IHeaderProps {}

export const Header: React.FC<IHeaderProps> = () => {
  return (
    <header>
      <Box mt={10} mb={6} display="flex" flexDirection="column" alignItems="center">
        LOGO FPO
      </Box>
    </header>
  );
};
