import * as React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Link as MuiLink, LinkProps as MuiLinkProps, makeStyles } from '@material-ui/core';
import { logger } from '@utils/logger';
import clsx from 'clsx';
import { setRef } from '@analytics/analyticsRef';

export interface ILinkProps extends Omit<RouterLinkProps, 'color'> {
  color?: MuiLinkProps['color'];
  disableStyling?: boolean;
  newTab?: boolean;
  state?: { [key: string]: any };
  to: string;
  /**
   * Provide a ref value which will supersede any existing analytics ref
   * as the new source referrer string after navigation.
   */
  analyticsRef?: string;
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
  target: '_blank',
  rel: 'noopener noreferrer',
};

/**
 * Wraps various Link functionality into one easy component - link to absolute or relative
 * URLs, open in new tab, remove link default styling, etc.
 */
export const Link = React.forwardRef<HTMLAnchorElement, ILinkProps>(
  ({ disableStyling, newTab, to, state, onClick: providedOnClick, analyticsRef, ...props }, ref) => {
    const classes = useStyles();

    const isAbsoluteURL = typeof to === 'string' && checkAbsoluteURL(to);

    // every absolute URL link opens in a new tab by default, but passing newTab={false} explicitly
    // can turn that off
    const extraProps = newTab || (isAbsoluteURL && newTab !== false) ? newTabProps : {};

    const isInvalidConfig = (isAbsoluteURL || newTab) && typeof to !== 'string' && typeof to !== 'undefined';
    React.useEffect(() => {
      if (isInvalidConfig) {
        logger.error(`You can't use a newTab Link with a complex to prop`);
      }
    }, [isInvalidConfig]);

    const onClick = React.useCallback(
      (ev: React.MouseEvent<any>) => {
        providedOnClick?.(ev);
        if (analyticsRef) {
          setRef(analyticsRef);
        }
      },
      [analyticsRef, providedOnClick]
    );

    // use an <a /> tag for absolute links or new tab links, and React Router for paths within the app
    // separate code path because <a /> accepts a very different and smaller set of props than RR Link
    if (isAbsoluteURL || newTab) {
      const href = typeof to !== 'string' && typeof to !== 'undefined' ? '#' : to;

      if (disableStyling) {
        return (
          <a
            className={clsx(classes.disableStyling, props.className)}
            href={href}
            ref={ref}
            onClick={onClick}
            {...props}
            {...extraProps}
          >
            {props.children}
          </a>
        );
      }

      return (
        <MuiLink href={href} ref={ref} onClick={onClick} {...props} {...extraProps}>
          {props.children}
        </MuiLink>
      );
    }

    if (disableStyling) {
      return (
        <RouterLink
          className={classes.disableStyling}
          to={state ? { pathname: to, state } : to}
          ref={ref}
          onClick={onClick}
          {...props}
          {...extraProps}
        />
      );
    }

    // RouterLink allows us to pass an object as the to prop, so we can
    // do things like easly pass history state via our Link component.
    return (
      <MuiLink
        component={RouterLink}
        underline={disableStyling ? 'none' : undefined}
        to={state ? { pathname: to, state } : to}
        ref={ref}
        onClick={onClick}
        {...props}
        {...extraProps}
      />
    );
  }
);
