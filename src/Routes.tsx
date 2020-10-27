import * as React from 'react';
import { RouteNames } from './constants/RouteNames';
import { Admin } from './pages/Admin/Admin';
import Room from './pages/room';
import JoinRoom from './pages/JoinRoom';
import SignupThroughInvite from './pages/SignupThroughInvite';
import { Signin } from './pages/SignIn/Signin';
import { FinalizeAccount } from './pages/FinalizeAccount/FinalizeAccount';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginWithEmail } from './pages/LoginWithEmail/LoginWithEmail';
import { VerifyEmail } from './pages/VerifyEmail/VerifyEmail';
import { Unsubscribe } from './pages/Unsubscribe/Unsubscribe';
import { useRoomName } from './hooks/useRoomName/useRoomName';
import { useAppState } from './state';
import useQuery from './hooks/useQuery/useQuery';
import { Redirect, Route, Switch } from 'react-router-dom';

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
  const query = useQuery();
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

      {/* commented out since we dont want people to hit this yet
      <Route exact path={Routes.SIGN_UP}>
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

      <Route path={RouteNames.INVITE}>
        <SignupThroughInvite />
      </Route>

      <Route path={RouteNames.LOGIN_IN_WITH_EMAIL}>
        <LoginWithEmail />
      </Route>

      <Route path={RouteNames.ADMIN}>
        <Admin />
      </Route>

      <Route path={RouteNames.UNSUBSCRIBE}>
        <Unsubscribe />
      </Route>

      <Route path="/:room_name">
        <NamedRoom />
      </Route>
    </Switch>
  );
};
