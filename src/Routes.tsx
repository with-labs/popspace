import * as React from 'react';
import { RouteNames } from './constants/RouteNames';
import { Admin } from './pages/Admin/Admin';
import Room from './pages/room';
import { Signin } from './pages/SignIn/Signin';
import { FinalizeAccount } from './pages/FinalizeAccount/FinalizeAccount';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginWithEmail } from './pages/LoginWithEmail/LoginWithEmail';
import { VerifyEmail } from './pages/VerifyEmail/VerifyEmail';
import { Unsubscribe } from './pages/Unsubscribe/Unsubscribe';
import { JoinRoom } from './pages/JoinRoom/JoinRoom';
import { useRoomName } from './hooks/useRoomName/useRoomName';
import { useAppState } from './state';
import useQueryParams from './hooks/useQueryParams/useQueryParams';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute/AdminRoute';
import { FlaggAdmin } from 'flagg/dist/react';

export interface IRoutesProps {}

// -------- here is the where we set up the with application
const NamedRoom = () => {
  const roomName = useRoomName();
  const { error, setError } = useAppState();

  if (!roomName) {
    return <Redirect to={RouteNames.ROOT} />;
  }

  return <Room name={roomName} error={error} setError={setError} />;
};

const RootView = () => {
  const { error, setError } = useAppState();
  const query = useQueryParams();
  const room: string | null = query.get('r');

  // we still support the use o the r query param, so we check if youre
  // trying to get in to a room, if we have it send you to the room
  if (room) {
    return <Room name={room} error={error} setError={setError} />;
  } else {
    // send them to the dash
    return <Dashboard />;
  }
};

export const Routes: React.FC<IRoutesProps> = (props) => {
  return (
    <Switch>
      <Route exact path={RouteNames.ROOT}>
        <RootView />
      </Route>

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

      <Route path={RouteNames.JOIN_ROOM}>
        <JoinRoom />
      </Route>

      <Route path={RouteNames.LOGIN_IN_WITH_EMAIL}>
        <LoginWithEmail />
      </Route>

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

      <Route path="/:room_name">
        <NamedRoom />
      </Route>
    </Switch>
  );
};
