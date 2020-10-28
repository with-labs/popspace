import * as React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Link as MuiLink, LinkProps as MuiLinkProps, makeStyles } from '@material-ui/core';

export interface ILinkProps extends Omit<RouterLinkProps, 'color'> {
  color?: MuiLinkProps['color'];
  disableStyling?: boolean;
  newTab?: boolean;
}

const useStyles = makeStyles({
  disableStyling: {
    color: 'inherit',
    fontWeight: 'inherit',
    textDecoration: 'none',
    '&:visited': {
      color: 'inherit',
      fontWeight: 'inherit',
      textDecoration: 'none',
    },
  },
});

function checkAbsoluteURL(path: string) {
  return /^\w+:/.test(path);
}

const newTabProps = {
  target: '_none',
  rel: 'noopener noreferrer',
};

/**
 * Wraps various Link functionality into one easy component - link to absolute or relative
 * URLs, open in new tab, remove link default styling, etc.
 */
export const Link: React.FC<ILinkProps> = ({ disableStyling, newTab, ...props }) => {
  const classes = useStyles();

  const isAbsoluteURL = typeof props.to === 'string' && checkAbsoluteURL(props.to);

  // every absolute URL link opens in a new tab by default, but passing newTab={false} explicitly
  // can turn that off
  const extraProps = newTab || (isAbsoluteURL && newTab !== false) ? newTabProps : {};

  const isInvalidConfig = (isAbsoluteURL || newTab) && typeof props.to !== 'string' && typeof props.to !== 'undefined';
  React.useEffect(() => {
    if (isInvalidConfig) {
      console.error(`You can't use a newTab Link with a complex to prop`);
    }
  }, [isInvalidConfig]);

  // use an <a /> tag for absolute links or new tab links, and React Router for paths within the app
  // separate code path because <a /> accepts a very different and smaller set of props than RR Link
  if (isAbsoluteURL || newTab) {
    const href = typeof props.to !== 'string' && typeof props.to !== 'undefined' ? '#' : props.to;

    if (disableStyling) {
      return (
        <a className={classes.disableStyling} href={href} {...extraProps}>
          {props.children}
        </a>
      );
    }

    return (
      <a href={href} {...extraProps}>
        {props.children}
      </a>
    );
  }

  if (disableStyling) {
    return <RouterLink className={classes.disableStyling} {...props} {...extraProps} />;
  }

  return <MuiLink component={RouterLink} underline={disableStyling ? 'none' : undefined} {...props} {...extraProps} />;
};
