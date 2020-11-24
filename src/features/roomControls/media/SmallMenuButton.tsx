import * as React from 'react';
import { IconButtonProps, makeStyles, IconButton } from '@material-ui/core';
import clsx from 'clsx';
import { DropdownFilledIcon } from '../../../components/icons/DropdownFilledIcon';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[50],
    marginLeft: 2,
  },
}));

export const SmallMenuButton: React.FC<IconButtonProps> = (props) => {
  const classes = useStyles();

  return (
    <IconButton size="small" {...props} className={clsx(classes.root, props.className)}>
      <DropdownFilledIcon style={{ fontSize: 10 }} />
    </IconButton>
  );
};
