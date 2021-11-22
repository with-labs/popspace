import * as React from 'react';
import { RouteProps, Route, Redirect } from 'react-router-dom';
import client from '@api/client';

export interface IAdminRouteProps extends RouteProps {
  fallback?: React.ReactElement;
}

/**
 * Only renders children if the user is confirmed by the API as an admin.
 */
export const AdminRoute: React.FC<IAdminRouteProps> = ({ fallback, children, render, ...rest }) => {
  const isAdmin = !!client.actor?.admin;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAdmin) {
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
