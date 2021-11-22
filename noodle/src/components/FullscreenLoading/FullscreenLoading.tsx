import { Box, BoxProps, CircularProgress } from '@material-ui/core';
import * as React from 'react';

export interface IFullscreenLoadingProps extends BoxProps {}

export function FullscreenLoading(props: IFullscreenLoadingProps) {
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="brandColors.snow.regular"
      position="fixed"
      {...props}
    >
      <CircularProgress />
    </Box>
  );
}
