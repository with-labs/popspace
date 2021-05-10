import * as React from 'react';
import { RouteNames } from './constants/RouteNames';
import { Admin } from './pages/Admin/Admin';
import { Signin } from './pages/SignIn/Signin';
import { FinalizeAccount } from './pages/FinalizeAccount/FinalizeAccount';
import { LoginWithEmail } from './pages/LoginWithEmail/LoginWithEmail';
import { VerifyEmail } from './pages/VerifyEmail/VerifyEmail';
import { Subscribe } from './pages/Subscribe/Subscribe';
import { Unsubscribe } from './pages/Unsubscribe/Unsubscribe';
import { Route, Switch, useHistory } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute/AdminRoute';
import { FlaggAdmin } from 'flagg/dist/react';
import { Page } from './Layouts/Page/Page';
import { AuthenticatedRoute } from './components/AuthenticatedRoute/AuthenticatedRoute';
import RoomPage from './pages/RoomPage/RoomPage';
import { InviteLink } from './pages/InviteLink/InviteLink';
import { Signup } from './pages/Signup/Signup';
import { CreateRoomPage } from './pages/CreateRoom/CreateRoomPage';
import { FullscreenLoading } from './components/FullscreenLoading/FullscreenLoading';
import { useCurrentUserProfile } from './hooks/api/useCurrentUserProfile';
import { useOrderedRooms } from './hooks/useOrderedRooms/useOrderedRooms';
import useQueryParams from './hooks/useQueryParams/useQueryParams';
import { MediaReadinessContext } from './components/MediaReadinessProvider/MediaReadinessProvider';

const LicensesPage = React.lazy(() => import('./pages/licenses/LicensesPage'));

export interface IRoutesProps {}

const RootView = () => {
  const history = useHistory();
  const { profile, error, isLoading: isProfileLoading } = useCurrentUserProfile();
  const { rooms, isLoading: isRoomsLoading } = useOrderedRooms(profile);
  const { resetReady } = React.useContext(MediaReadinessContext);

  const query = useQueryParams();
  const queryError = query.get('e');

  React.useEffect(() => {
    if (error) {
      // todo: add error to query string here?
      history.push(RouteNames.SIGN_IN);
    }
  }, [error, history]);

  React.useEffect(() => {
    if (queryError) {
      // if we have an error on the query string,
      // reset the ready is ready so we dont enter a room
      // so the user can see the error
      resetReady();
    }

    if (!isProfileLoading && !isRoomsLoading) {
      // if the user has no rooms then we redirect to the onboarding
      if (!error && rooms.length === 0) {
        history.push(`${RouteNames.CREATE_ROOM}?onboarding=true`);
      } else {
        // hitting the route will redirect us to the first room in
        // returned by useOrderedRooms.
        // either their default room or the first room they have
        // TOOD: expand this to use last entered room as the first choice?
        history.replace({
          pathname: `/${rooms[0].route}`,
          search: `${history.location.search}`,
        });
      }
    }
  }, [history, rooms, isRoomsLoading, isProfileLoading, error, queryError, resetReady]);

  return <FullscreenLoading />;
};

export const Routes: React.FC<IRoutesProps> = (props) => {
  return (
    <Switch>
      <AuthenticatedRoute exact path={RouteNames.ROOT}>
        <RootView />
      </AuthenticatedRoute>

      <Route exact path={RouteNames.SIGN_IN}>
        <Signin />
      </Route>

      <Route exact path={RouteNames.SIGN_UP}>
        <Signup />
      </Route>

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
        <FinalizeAccount />
      </Route>

      {/* 
        3/30/2021
        we are currently starting the transition from /invite -> /join
        so we will keep /invite availible for backward support.
      */}
      <Route path={RouteNames.INVITE} component={InviteLink} />
      <Route path={RouteNames.JOIN} component={InviteLink} />

      <AuthenticatedRoute path={RouteNames.CREATE_ROOM} component={CreateRoomPage} />

      <AdminRoute path={RouteNames.ADMIN}>
        <Admin />
      </AdminRoute>
      <AdminRoute
        path={RouteNames.FEATURE_FLAGS}
        render={({ history }) => <FlaggAdmin onDone={() => history.push('/')} />}
      />

      <Route path={RouteNames.SUBSCRIBE}>
        <Subscribe />
      </Route>

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
