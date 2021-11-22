import * as React from 'react';
import { IconButtonProps, makeStyles, IconButton } from '@material-ui/core';
import clsx from 'clsx';
import { DropdownIcon } from '@components/icons/DropdownIcon';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.common.white,
    position: 'relative',
    zIndex: 1,
    left: -8,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: 2,
    width: 24,
    height: 24,
    color: theme.palette.grey[900],
    boxShadow: theme.focusRings.create('transparent', true),
    '&:focus': {
      boxShadow: theme.focusRings.create(theme.palette.brandColors.oregano.ink, true),
    },
  },
  icon: {
    fontSize: 20,
    position: 'relative',
  },
}));

export const SmallMenuButton: React.FC<IconButtonProps> = (props) => {
  const classes = useStyles();

  return (
    <IconButton size="small" {...props} className={clsx(classes.root, props.className)}>
      <DropdownIcon className={classes.icon} fontSize="small" color="inherit" />
    </IconButton>
  );
};
