import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { useQuery } from 'react-query';
import { ApiUser } from '../../utils/api';

export function useAnalyticsUserIdentity() {
  const { data } = useQuery<{ profile?: { user: ApiUser } }>('/user_profile');
  const profile = data?.profile;

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
