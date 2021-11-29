import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import * as React from 'react';

export interface IKeyShortcutTextProps {
  /** A shortcut string, i.e. "Cmd+A" */
  children: string;
  className?: string;
  style?: React.CSSProperties;
}

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: theme.typography.fontWeightMedium as any,
    display: 'inline-block',
    // roughly square
    minWidth: '2em',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: theme.palette.grey[900],
    backgroundColor: theme.palette.background.paper,
    padding: `0 8px`,
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: 4,
  },
}));

/**
 * Renders keyboard shortcuts as small "key" graphics for user comprehension of their meaning
 */
export const KeyShortcutText: React.FC<IKeyShortcutTextProps> = ({ children, className, ...rest }) => {
  const classes = useStyles();

  return (
    <span className={clsx(classes.root, className)} {...rest}>
      {children}
    </span>
  );
};
