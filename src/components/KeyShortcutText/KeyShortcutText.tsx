import * as React from 'react';
import { makeStyles } from '@material-ui/core';

export interface IKeyShortcutTextProps {
  /** Defaults "+" */
  separator?: string;
  /** A shortcut string, i.e. "Cmd+A" */
  children: string;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'inline-flex',
    flexDirection: 'row',
    '&:not(:first-child)': {
      marginLeft: 4,
    },
    '&:not(:last-child)': {
      marginRight: 4,
    },
  },
  key: {
    fontSize: theme.typography.pxToRem(14),
    fontFamily: 'monospace',
    display: 'inline-block',
    // roughly square
    minWidth: '2em',
    textAlign: 'center',
    textTransform: 'uppercase',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    padding: 2,
    border: `1px solid ${theme.palette.grey[900]}`,
    borderRadius: 4,
    '& + &': {
      marginLeft: 2,
    },
  },
}));

/**
 * Renders keyboard shortcuts as small "key" graphics for user comprehension of their meaning
 */
export const KeyShortcutText: React.FC<IKeyShortcutTextProps> = ({ separator = '+', children }) => {
  const classes = useStyles();

  const parts = children.split(separator);

  return (
    <span className={classes.root}>
      {parts.map((key) => (
        <span key={key} className={classes.key}>
          {key}
        </span>
      ))}
    </span>
  );
};
