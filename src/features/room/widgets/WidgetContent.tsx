import * as React from 'react';
import { Box } from '@material-ui/core';

export interface IWidgetContentProps {
  disablePadding?: boolean;
  className?: string;
}

export const WidgetContent: React.FC<IWidgetContentProps> = (props) => {
  return (
    <Box
      p={props.disablePadding ? 0 : 2}
      overflow="hidden"
      flex={1}
      width="100%"
      position="relative"
      minWidth={250}
      minHeight={120}
      className={props.className}
    >
      {props.children}
    </Box>
  );
};
