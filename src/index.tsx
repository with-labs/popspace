import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';

import { CssBaseline } from '@material-ui/core';
import { StylesProvider } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles';

import AppStateProvider, { useAppState } from './state';
import { BrowserRouter as Router, Route, Switch, useParams } from 'react-router-dom';
import { ConnectOptions } from 'twilio-video';
import { mandarin as theme } from './theme/theme';
import './types';
import { VideoProvider } from './components/VideoProvider';

import useQuery from './withHooks/useQuery/useQuery';

import { Routes } from './constants/Routes';

import Room from './pages/room';
import Signup from './pages/signup';
import JoinRoom from './pages/JoinRoom';
import SignupThroughInvite from './pages/SignupThroughInvite';

import { Signin } from './pages/SignIn/Signin';
import { FinalizeAccount } from './pages/FinalizeAccount/FinalizeAccount';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Admin } from './pages/Admin/Admin';
import { LoginWithEmail } from './pages/LoginWithEmail/LoginWithEmail';
import { VerifyEmail } from './pages/VerifyEmail/VerifyEmail';

import './with.css';

import packageJson from '../package.json';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    release: 'with-app@' + packageJson.version,
    normalizeDepth: 10, // Bump this up so we can get the most out of the Redux integration.
  });
}

// See: https://media.twiliocdn.com/sdk/js/video/releases/2.0.0/docs/global.html#ConnectOptions
// for available connection options.
const connectionOptions: ConnectOptions = {
  bandwidthProfile: {
    video: {
      mode: 'collaboration',
      renderDimensions: {
        high: { height: 1080, width: 1920 },
        standard: { height: 90, width: 160 },
        low: { height: 90, width: 160 },
      },
    },
  },
  dominantSpeaker: true,
  maxAudioBitrate: 12000,
  networkQuality: { local: 1, remote: 1 },
  preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
};

// -------- here is the where we set up the with application
const NamedRoom = () => {
  const params: any = useParams();
  const roomName = params['room_name'];
  const { error, setError } = useAppState();
  return (
    <VideoProvider options={connectionOptions} onError={setError}>
      <Room name={roomName} error={error} setError={setError} />
    </VideoProvider>
  );
};

const RootView = () => {
  const { error, setError } = useAppState();
  const query = useQuery();
  const room: string | null = query.get('r');
  // we still support the use o the r query param, so we check if youre
  // trying to get in to a room, if we have it send you to the room
  if (room) {
    return (
      <VideoProvider options={connectionOptions} onError={setError}>
        <Room name={room} error={error} setError={setError} />
      </VideoProvider>
    );
  } else if (window.localStorage.getItem('__withso_admin')) {
    // we have the landing page feature flagged. If the user
    // has the correct flag set, send them to the dash
    return <Dashboard />;
  } else {
    // if not going to a room, or have the feature flag,
    // send the peson back to the product landing page
    window.location.href = 'https://with.so';
    return <div />;
  }
};

const EnableAdmin = () => {
  return (
    <div style={{ color: 'black' }}>
      <button
        onClick={() => {
          window.localStorage.setItem('__withso_admin', 'true');
        }}
      >
        {' '}
        Become admin
      </button>
      <button
        onClick={() => {
          window.localStorage.removeItem('__withso_admin');
        }}
      >
        {' '}
        Unbecome admin
      </button>
    </div>
  );
};

// injectFirst on the styles provider tells material ui to inject our styles before the
// base classes so we can avoid having to put !important flags on all of our positional css
// https://material-ui.com/guides/interoperability/#controlling-priority-4
ReactDOM.render(
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppStateProvider>
          <Switch>
            <Route exact path={Routes.ROOT}>
              <RootView />
            </Route>

            <Route exact path={Routes.ENABLE_ADMIN}>
              <EnableAdmin />
            </Route>

            <Route exact path={Routes.SIGN_IN}>
              <Signin />
            </Route>

            <Route exact path={Routes.SIGN_UP}>
              <Signup />
            </Route>

            <Route path={Routes.CLAIM_ROOM}>
              <FinalizeAccount />
            </Route>

            <Route path={Routes.COMPLETE_SIGNUP}>
              <VerifyEmail />
            </Route>

            <Route path={Routes.JOIN_ROOM}>
              <JoinRoom />
            </Route>

            <Route path={Routes.INVITE}>
              <SignupThroughInvite />
            </Route>

            <Route path={Routes.LOGIN_IN_WITH_EMAIL}>
              <LoginWithEmail />
            </Route>

            <Route path="/:room_name">
              <NamedRoom />
            </Route>
          </Switch>
        </AppStateProvider>
      </Router>
    </MuiThemeProvider>
  </StylesProvider>,
  // The Modal componenet requires being bound to root element of app.
  // If this root element ever changes, the Modal's root must also be updated
  // You can find the Modal at src/withComponents/SettingsModal/SettingsModal.tsx
  // Modal.setAppElement('#root');
  document.getElementById('root')
);
