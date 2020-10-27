import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import api from '../../utils/api';
import { useAuth } from '../useAuth/useAuth';

export function useAnalyticsUserIdentity() {
  const { isLoggedIn, sessionToken } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      // fetch user details and set on various third party tools
      api.getProfile(sessionToken).then(({ profile, success, errorCode, message }) => {
        if (!success || !profile) {
          Sentry.captureEvent({
            level: Sentry.Severity.Debug,
            message: `Failed attempt to identify logged-in user: ${message} (code: ${errorCode})`,
          });
          return;
        }

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
      });
    } else {
      // remove user association on logout
      Sentry.setUser(null);
    }
  }, [isLoggedIn, sessionToken]);
}
