import * as React from 'react';
import { IconButtonProps, makeStyles, IconButton } from '@material-ui/core';
import clsx from 'clsx';
import { DropdownFilledIcon } from '../../../components/icons/DropdownFilledIcon';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[50],
    position: 'relative',
    zIndex: 1,
    left: -8,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: 0,
  },
  icon: {
    fontSize: 24,
    position: 'relative',
  },
}));

export const SmallMenuButton: React.FC<IconButtonProps> = (props) => {
  const classes = useStyles();

  return (
    <IconButton size="small" {...props} className={clsx(classes.root, props.className)}>
      <DropdownFilledIcon className={classes.icon} />
    </IconButton>
  );
};
