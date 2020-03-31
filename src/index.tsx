import React from 'react';
import ReactDOM from 'react-dom';

import { CssBaseline } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';

import App from './App';
import AppStateProvider, { useAppState } from './state';
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { ConnectOptions, TwilioError } from 'twilio-video';
import ErrorDialog from './components/ErrorDialog/ErrorDialog';
import theme from './theme';
import './types';
import { VideoProvider } from './components/VideoProvider';

import AnglesApp from './AnglesApp';
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

const VideoApp = () => {
  const { error, setError } = useAppState();

  return (
    <VideoProvider options={connectionOptions} onError={setError}>
      <ErrorDialog dismissError={() => setError(null)} error={error} />
      <App />
    </VideoProvider>
  );
};

// -------- here is the where we set up the angles application

const AnglesMainApp = () => {
  const { error, setError } = useAppState();
  const query = useQuery();
  const room: string | null = query.get('r');

  return (
    <VideoProvider options={connectionOptions} onError={setError}>
      {room ? (
        <div>
          <ErrorDialog dismissError={() => setError(null)} error={error} />
          <AnglesApp roomName={room} />
        </div>
      ) : (
        <ErrorDialog
          dismissError={() => setError(null)}
          error={new Error('A room name is required to access the application.') as TwilioError}
        />
      )}
    </VideoProvider>
  );
};

// -----------

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <AppStateProvider>
        <Switch>
          <Route exact path="/">
            <AnglesMainApp />
          </Route>
          <Redirect to="/" />
        </Switch>
      </AppStateProvider>
    </Router>
  </MuiThemeProvider>,
  document.getElementById('root')
);
