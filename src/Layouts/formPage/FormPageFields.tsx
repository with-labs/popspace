import { Box, BoxProps } from '@material-ui/core';
import * as React from 'react';

export function FormPageFields(props: BoxProps) {
  return <Box display="flex" flexDirection="column" mb={2} {...props} />;
}
