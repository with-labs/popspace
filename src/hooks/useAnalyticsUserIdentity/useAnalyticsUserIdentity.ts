import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useCurrentUserProfile } from '../api/useCurrentUserProfile';
import { logger } from '@utils/logger';

export function useAnalyticsUserIdentity() {
  const { user } = useCurrentUserProfile();

  useEffect(() => {
    if (user) {
      const { email, display_name: name, id } = user;
      Sentry.setUser({
        email,
        username: name,
        id,
      });
      if (process.env.REACT_APP_CANNY_APP_ID) {
        Canny('identify', {
          appID: process.env.REACT_APP_CANNY_APP_ID,
          user: {
            email,
            id,
            name,
          },
        });
      } else {
        logger.warn('Canny App ID not found');
      }
    } else {
      // remove user association on logout
      Sentry.setUser(null);
    }
  }, [user]);
}
