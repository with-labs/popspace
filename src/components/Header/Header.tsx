import React from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as Logo } from '@src/images/logo.svg';
import { useHistory } from 'react-router-dom';
import { RouteNames } from '@constants/RouteNames';

interface IHeaderProps {}

export const Header: React.FC<IHeaderProps> = () => {
  const history = useHistory();

  const onLogoClick = () => {
    history.push(RouteNames.ROOT);
  };
  return (
    <header>
      <Box mt={10} mb={6} display="flex" flexDirection="column" alignItems="center">
        <Box onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <Logo />
        </Box>
      </Box>
    </header>
  );
};
