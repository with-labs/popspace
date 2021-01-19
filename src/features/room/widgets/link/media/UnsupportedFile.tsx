import * as React from 'react';
import { Box } from '@material-ui/core';
import { AttachFile } from '@material-ui/icons';

/**
 * Renders a simple placeholder
 */
export const UnsupportedFile: React.FC = () => {
  return (
    <Box
      minWidth={240}
      minHeight={240}
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      alignContent="center"
    >
      <AttachFile style={{ display: 'block', margin: 'auto', fontSize: 64 }} />
    </Box>
  );
};
