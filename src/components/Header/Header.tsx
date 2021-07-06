import React from 'react';
import { Box } from '@material-ui/core';
import { Logo } from '@components/Logo/Logo';

interface IHeaderProps {}

export const Header: React.FC<IHeaderProps> = () => {
  return (
    <header>
      <Box mt={10} mb={6} display="flex" flexDirection="column" alignItems="center">
        <Logo link inRoom={false} />
      </Box>
    </header>
  );
};
