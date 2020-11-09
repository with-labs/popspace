import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useCurrentUserProfile } from '../useCurrentUserProfile/useCurrentUserProfile';

export function useAnalyticsUserIdentity() {
  const profile = useCurrentUserProfile();

  useEffect(() => {
    if (profile) {
      const { email, display_name: name, id } = profile.user;
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
        Sentry.captureMessage('Canny App ID not found', Sentry.Severity.Warning);
      }
    } else {
      // remove user association on logout
      Sentry.setUser(null);
    }
  }, [profile]);
}
