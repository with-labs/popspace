import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';

import { CssBaseline } from '@material-ui/core';
import { StylesProvider, makeStyles } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';

import AppStateProvider, { useAppState } from './state';
import { BrowserRouter as Router, Route, Switch, useParams } from 'react-router-dom';
import { mandarin as theme } from './theme/theme';
import './types/twilio';

import useQuery from './withHooks/useQuery/useQuery';

import { Routes } from './constants/Routes';
import Room from './pages/room';
import Signup from './pages/signup';
import JoinRoom from './pages/JoinRoom';
import SignupThroughInvite from './pages/SignupThroughInvite';

import { Signin } from './pages/SignIn/Signin';
import { FinalizeAccount } from './pages/FinalizeAccount/FinalizeAccount';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginWithEmail } from './pages/LoginWithEmail/LoginWithEmail';
import { VerifyEmail } from './pages/VerifyEmail/VerifyEmail';
import './i18n';

import './with.css';

const version = `with-app@${VERSION || 'unknown'}`;
// @ts-ignore
window.__with_version__ = version;
if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    release: version,
    normalizeDepth: 10, // Bump this up so we can get the most out of the Redux integration.
  });
}

// -------- here is the where we set up the with application
const NamedRoom = () => {
  const params: any = useParams();
  const roomName = params['room_name'];
  const { error, setError } = useAppState();
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

// styles to override the default styles
const useStyles = makeStyles((themeObj) => ({
  success: {
    color: `${themeObj.palette.common.black} !important`,
    backgroundColor: `${themeObj.palette.success.main} !important`,
  },
  error: {
    color: themeObj.palette.success.contrastText,
    backgroundColor: `${themeObj.palette.error.main} !important`,
  },
}));

const SnackbarWrapper = (props: any) => {
  const { children } = props;
  const styles = useStyles();
  return (
    <SnackbarProvider
      maxSnack={3}
      classes={{
        variantSuccess: styles.success,
        variantError: styles.error,
      }}
      hideIconVariant
    >
      {children}
    </SnackbarProvider>
  );
};

// injectFirst on the styles provider tells material ui to inject our styles before the
// base classes so we can avoid having to put !important flags on all of our positional css
// https://material-ui.com/guides/interoperability/#controlling-priority-4
ReactDOM.render(
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={theme}>
      <SnackbarWrapper>
        <CssBaseline />
        <Router>
          <AppStateProvider>
            <Switch>
              <Route exact path={Routes.ROOT}>
                <RootView />
              </Route>

              <Route exact path={Routes.SIGN_IN}>
                <Signin />
              </Route>

              {/* commented out since we dont want people to hit this yet
              <Route exact path={Routes.SIGN_UP}>
                <Signup />
              </Route> */}

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
      </SnackbarWrapper>
    </MuiThemeProvider>
  </StylesProvider>,
  // The Modal componenet requires being bound to root element of app.
  // If this root element ever changes, the Modal's root must also be updated
  // You can find the Modal at src/withComponents/SettingsModal/SettingsModal.tsx
  // Modal.setAppElement('#root');
  document.getElementById('root')
);
