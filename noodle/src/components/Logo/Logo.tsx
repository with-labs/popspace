import * as React from 'react';
import { Link } from '@components/Link/Link';
import { RouteNames } from '@constants/RouteNames';
import { ReactComponent as Logomark } from '@src/images/logo.svg';
import { EventNames } from '@analytics/constants';
import { Analytics } from '@analytics/Analytics';
import { Box } from '@material-ui/core';
export interface LogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** make it a link to the homepage */
  link?: boolean;
  newTab?: boolean;
  inRoom?: boolean;
  beamerTrigger?: boolean;
}

export function Logo({ link, newTab, inRoom, beamerTrigger, ...rest }: LogoProps) {
  if (link) {
    return (
      <Link
        to={RouteNames.ROOT}
        newTab={newTab}
        onClick={() => Analytics.trackEvent(EventNames.BUTTON_CLICKED, 'logo', { inRoom })}
      >
        <Logomark title="The PopSpace logo" {...rest} />
      </Link>
    );
  }

  if (beamerTrigger) {
    return (
      <Box className="beamerTrigger" width={90}>
        <Logomark title="The PopSpace logo" {...rest} />
      </Box>
    );
  }

  return <Logomark title="The PopSpace logo" {...rest} />;
}
