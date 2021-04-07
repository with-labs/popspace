import * as React from 'react';
import { RouteProps, Route, useHistory } from 'react-router-dom';
import { useCurrentUserProfile } from '../../hooks/api/useCurrentUserProfile';
import { RouteNames } from '../../constants/RouteNames';
import { FullscreenLoading } from '../FullscreenLoading/FullscreenLoading';

/**
 * Protects a route, requiring signin first. Redirects to signin page
 * if the user is not signed in.
 */
export const AuthenticatedRoute: React.FC<RouteProps> = ({ children, render, ...rest }) => {
  const { user, isLoading } = useCurrentUserProfile();
  const isLoggedIn = !!user;
  const history = useHistory();

  React.useEffect(() => {
    if (!isLoggedIn && !isLoading) {
      history.push(RouteNames.SIGN_IN, {
        returnTo: history.location.pathname,
      });
    }
  }, [isLoggedIn, isLoading, history]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (user) {
          if (render) {
            return render(props);
          } else {
            return children;
          }
        }
        return <FullscreenLoading />;
      }}
    />
  );
};
