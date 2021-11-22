// create our brower history to pass into the router and to use
// this outside of react components.
import { logger } from '@utils/logger';
import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

history.listen((location) => {
  // when visiting the root path, reload the page so we re-request the landing site
  if (location.pathname === '/') {
    logger.debug('Reloading for homepage navigation');
    window.location.pathname = '/';
  }
});

export default history;
