import React from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as Logo } from '@src/images/logo.svg';

interface IHeaderProps {}

export const Header: React.FC<IHeaderProps> = () => {
  return (
    <header>
      <Box mt={10} mb={6} display="flex" flexDirection="column" alignItems="center">
        <Logo />
      </Box>
    </header>
  );
};
