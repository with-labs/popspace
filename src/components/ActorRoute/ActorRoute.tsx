import * as React from 'react';
import { RouteProps, Route } from 'react-router-dom';
import { FullscreenLoading } from '../FullscreenLoading/FullscreenLoading';
import client from '@src/api/client';

/**
 * Protects a route, requiring actor creation first. If the user doesn't
 * have a session, it waits for creation of that session before proceeding.
 */
export const ActorRoute: React.FC<RouteProps> = ({ children, render, ...rest }) => {
  const [hasActor, setHasActor] = React.useState(!!client.actor);

  React.useEffect(() => {
    if (!hasActor) {
      client.createActor().then(() => setHasActor(true));
    }
  }, [hasActor]);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (hasActor) {
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
