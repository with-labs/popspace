import * as React from 'react';
import { ApiUser } from '../../utils/api';
import { useQuery } from 'react-query';
import { RouteProps, Route, Redirect } from 'react-router-dom';
import { FullscreenLoading } from '../FullscreenLoading/FullscreenLoading';

export interface IAdminRouteProps extends RouteProps {
  fallback?: React.ReactElement;
}

/**
 * Only renders children if the user is confirmed by the API as an admin.
 */
export const AdminRoute: React.FC<IAdminRouteProps> = ({ fallback, children, render, ...rest }) => {
  const { data, isLoading } = useQuery<{ profile?: { user: ApiUser } }>('/user_profile');

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isLoading) return <FullscreenLoading />;

        if (data?.profile?.user.admin) {
          if (render) {
            return render(props);
          }
          return children;
        }

        return fallback ?? <Redirect to="/" />;
      }}
    />
  );
};
