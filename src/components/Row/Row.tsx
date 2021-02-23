import { Box, BoxProps, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

export interface RowProps extends Omit<BoxProps, 'ref'> {
  gap?: number;
}

const useStyles = makeStyles<Theme, RowProps>((theme) => ({
  root: ({ gap = 2 }) => ({
    display: 'flex',
    flexDirection: 'row',
    '& > * + *': {
      marginLeft: theme.spacing(gap),
    },
  }),
}));

export const Row: React.FC<RowProps> = (props) => {
  const classes = useStyles(props);
  const { gap: _, className, ...rest } = props;
  return <Box {...rest} className={clsx(classes.root, className)} />;
};
