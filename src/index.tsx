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
import VerifyEmail from './pages/verify_email';
import Login from './pages/login';

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

const Home = () => {
  return <Landing />;
};

const NamedRoom = () => {
  const params: any = useParams();
  const roomName: any = params['room_name'];
  const { error, setError } = useAppState();
  console.log(params, roomName);
  return (
    <VideoProvider options={connectionOptions} onError={setError}>
      <Room name={roomName} error={error} setError={setError} />
    </VideoProvider>
  );
};

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <AppStateProvider>
        <Switch>
          <Route exact path="/">
            <Home />
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

          <Route path="/:room_name">
            <NamedRoom />
          </Route>

          {/*<Redirect to="/" />*/}
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
