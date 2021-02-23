import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import { Link } from '../Link/Link';

export interface ILogoProps extends React.HTMLAttributes<SVGSVGElement> {
  link?: boolean;
}

const useStyles = makeStyles((theme) => ({
  w: {
    fill: '#EE6659',
  },
  i: {
    fill: '#6DCBC2',
  },
  t: {
    fill: '#F3A110',
  },
  h: {
    fill: '#8181C5',
  },
}));

export const Logo = React.forwardRef<SVGSVGElement, ILogoProps>(({ link, ...props }, ref) => {
  const classes = useStyles();
  const graphic = (
    <svg width="68" height="30" viewBox="0 0 68 30" fill="none" xmlns="http://www.w3.org/2000/svg" ref={ref} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 12H8V22V30C3.58172 30 0 26.4183 0 22V12ZM10 12H18V22C18 26.4183 14.4183 30 10 30V22V12ZM20 12H28V22C28 26.4183 24.4183 30 20 30V22V12Z"
        className={classes.w}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34 2C31.7909 2 30 3.79086 30 6C30 8.20914 31.7909 10 34 10C36.2091 10 38 8.20914 38 6C38 3.79086 36.2091 2 34 2ZM38 30V12H30V30H38Z"
        className={classes.i}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48 7L48 12V22V30C43.5817 30 40 26.4183 40 22V19V12V11.5859C42.5872 10.8542 44.787 9.19947 46.2211 7H48Z"
        className={classes.t}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M58 0H50V30H58V0ZM60 12C64.4183 12 68 15.5817 68 20V30H60V20V12Z"
        className={classes.h}
      />
    </svg>
  );

  if (link) {
    return (
      <Link disableStyling to="/" className={props.className}>
        {graphic}
      </Link>
    );
  }

  return graphic;
});
