import * as React from 'react';
import { RouteNames } from './constants/RouteNames';
import { Admin } from './pages/Admin/Admin';
import { Signin } from './pages/SignIn/Signin';
import { FinalizeAccount } from './pages/FinalizeAccount/FinalizeAccount';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginWithEmail } from './pages/LoginWithEmail/LoginWithEmail';
import { VerifyEmail } from './pages/VerifyEmail/VerifyEmail';
import { Unsubscribe } from './pages/Unsubscribe/Unsubscribe';
import useQueryParams from './hooks/useQueryParams/useQueryParams';
import { Route, Switch, useHistory } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute/AdminRoute';
import { FlaggAdmin } from 'flagg/dist/react';
import { Page } from './Layouts/Page/Page';
import { AuthenticatedRoute } from './components/AuthenticatedRoute/AuthenticatedRoute';
import RoomPage from './pages/room';
import { JoinRoom } from './pages/JoinRoom/JoinRoom';
import { InviteLink } from './pages/InviteLink/InviteLink';
import { useFeatureFlag } from 'flagg';

const LicensesPage = React.lazy(() => import('./pages/licenses/LicensesPage'));

export interface IRoutesProps {}

const RootView = () => {
  const query = useQueryParams();
  const room: string | null = query.get('r');
  const history = useHistory();

  React.useEffect(() => {
    if (room) {
      history.replace(`/${room}`);
    }
  }, [room, history]);

  // we still support the use o the r query param, so we check if youre
  // trying to get in to a room, if we have it send you to the room
  if (room) {
    return null;
  } else {
    // send them to the dash
    return <Dashboard />;
  }
};

export const Routes: React.FC<IRoutesProps> = (props) => {
  const [hasInviteLink] = useFeatureFlag('inviteLink');

  return (
    <Switch>
      <AuthenticatedRoute exact path={RouteNames.ROOT}>
        <RootView />
      </AuthenticatedRoute>

      <Route exact path={RouteNames.SIGN_IN}>
        <Signin />
      </Route>

      {/* commented out since we dont want people to hit this yet */}
      {/* <Route exact path={RouteNames.SIGN_UP}>
        <Signup />
      </Route> */}

      <Route path={RouteNames.CLAIM_ROOM}>
        <FinalizeAccount />
      </Route>

      <Route path={RouteNames.COMPLETE_SIGNUP}>
        <VerifyEmail />
      </Route>

      <Route path={RouteNames.LOGIN_IN_WITH_EMAIL}>
        <LoginWithEmail />
      </Route>

      <Route path={RouteNames.JOIN_ROOM}>
        <JoinRoom />
      </Route>

      {hasInviteLink && <Route path={RouteNames.INVITE} component={InviteLink} />}

      <AdminRoute path={RouteNames.ADMIN}>
        <Admin />
      </AdminRoute>
      <AdminRoute
        path={RouteNames.FEATURE_FLAGS}
        render={({ history }) => <FlaggAdmin onDone={() => history.push('/')} />}
      />

      <Route path={RouteNames.UNSUBSCRIBE}>
        <Unsubscribe />
      </Route>

      <Route path={RouteNames.LICENSES}>
        <React.Suspense fallback={<Page isLoading />}>
          <LicensesPage />
        </React.Suspense>
      </Route>

      <AuthenticatedRoute
        path="/:roomRoute"
        render={(renderProps) => {
          return <RoomPage name={renderProps.match.params.roomRoute} />;
        }}
      />
    </Switch>
  );
};
