import { logger } from '@utils/logger';
import * as React from 'react';

export function LandingPage() {
  React.useEffect(() => {
    if (window.location.search.includes('ref=app')) {
      // we reloaded and we're back here. Don't do an infinite reload loop...
      // just navigate right to the landing page site.
      logger.critical('Landing page redirect failed');
      window.location.href = 'https://tilde.so?ref=app';
    } else {
      // reload this page with query ref=app
      window.location.href = `${window.location.origin}?ref=app`;
    }
  }, []);
  return null;
}
