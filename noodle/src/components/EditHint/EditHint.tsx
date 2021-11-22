import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';
import { EditIcon } from '../icons/EditIcon';

export interface IEditHintProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.palette.background.paper,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 8,

    'button:focus > &': {
      boxShadow: theme.focusRings.primary,
    },
  },
}));

export const EditHint: React.FC<IEditHintProps> = ({ className, ...props }) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.root, className)} {...props}>
      <EditIcon />
    </div>
  );
};
