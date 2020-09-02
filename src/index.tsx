import React from 'react';
import ReactDOM from 'react-dom';

import { CssBaseline } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';

import AppStateProvider, { useAppState } from './state';
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation, useParams } from 'react-router-dom';
import { ConnectOptions, TwilioError } from 'twilio-video';
import theme from './theme';
import './types';
import { VideoProvider } from './components/VideoProvider';

import Room from './pages/room';
import Landing from './pages/landing';
import Signup from './pages/signup';
import VerifyEmail from './pages/verifyEmail';
import Login from './pages/login';
import JoinRoom from './pages/JoinRoom';

import './with.css';

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

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// -------- here is the where we set up the angles application
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

const RedirectOrRoom = () => {
  const query = useQuery();
  const room: string | null = query.get('r');
  const { error, setError } = useAppState();
  if (room) {
    return (
      <VideoProvider options={connectionOptions} onError={setError}>
        <Room name={room} error={error} setError={setError} />
      </VideoProvider>
    );
  } else {
    window.location.href = 'https://with.so';
    return <div />;
  }
};

const LandingOrRoom = () => {
  const query = useQuery();
  const room: string | null = query.get('r');
  const { error, setError } = useAppState();
  if (room) {
    return (
      <VideoProvider options={connectionOptions} onError={setError}>
        <Room name={room} error={error} setError={setError} />
      </VideoProvider>
    );
  } else {
    return <Landing />;
  }
};

const LandingPageOrRedirect = () => {
  if (window.localStorage.getItem('__withso_admin')) {
    return <LandingOrRoom />;
  } else {
    return <RedirectOrRoom />;
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

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <AppStateProvider>
        <Switch>
          <Route exact path="/">
            <LandingPageOrRedirect />
          </Route>

          <Route exact path="/1_secret_2_admin_3_enabler_4">
            <EnableAdmin />
          </Route>

          <Route exact path="/signup">
            <Signup />
          </Route>

          <Route path="/complete_signup">
            <VerifyEmail />
          </Route>

          <Route path="/login">
            <Login />
          </Route>

          <Route path="/join_room">
            <JoinRoom />
          </Route>

          <Route path="/:room_name">
            <NamedRoom />
          </Route>
        </Switch>
      </AppStateProvider>
    </Router>
  </MuiThemeProvider>,
  // The Modal componenet requires being bound to root element of app.
  // If this root element ever changes, the Modal's root must also be updated
  // You can find the Modal at src/withComponents/SettingsModal/SettingsModal.tsx
  // Modal.setAppElement('#root');
  document.getElementById('root')
);
