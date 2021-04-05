import { Box, BoxProps, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

export interface SpacingProps extends Omit<BoxProps, 'ref'> {
  gap?: number;
}

const useStyles = makeStyles<Theme, SpacingProps>((theme) => ({
  vertical: ({ gap = 2 }) => ({
    '& > * + *': {
      marginTop: theme.spacing(gap),
    },
  }),
  horizontal: ({ gap = 2 }) => ({
    '& > * + *': {
      marginLeft: theme.spacing(gap),
    },
  }),
}));

export const Spacing = React.forwardRef<HTMLDivElement, SpacingProps>((props, ref) => {
  const classes = useStyles(props);
  const { gap: _, className, ...rest } = props;
  const vertical = rest.flexDirection === 'column' || rest.flexDirection === 'column-reverse';
  return (
    <Box
      flexDirection="row"
      display="flex"
      {...({ ref } as any)}
      {...rest}
      className={clsx(
        {
          [classes.vertical]: vertical,
          [classes.horizontal]: !vertical,
        },
        className
      )}
    />
  );
});
