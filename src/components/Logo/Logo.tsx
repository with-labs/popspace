import * as React from 'react';
import { Link } from '@components/Link/Link';
import { RouteNames } from '@constants/RouteNames';
import { ReactComponent as Logomark } from '@src/images/logo.svg';

export interface LogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** make it a link to the homepage */
  link?: boolean;
  newTab?: boolean;
}

export function Logo({ link, newTab, ...rest }: LogoProps) {
  if (link) {
    return (
      <Link to={RouteNames.ROOT} newTab={newTab}>
        <Logomark title="The Tilde logo" {...rest} />
      </Link>
    );
  }
  return <Logomark title="The Tilde logo" {...rest} />;
}
