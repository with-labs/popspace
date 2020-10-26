import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { App } from './App';

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
    environment: process.env.NODE_ENV,
  });
}

// injectFirst on the styles provider tells material ui to inject our styles before the
// base classes so we can avoid having to put !important flags on all of our positional css
// https://material-ui.com/guides/interoperability/#controlling-priority-4
ReactDOM.render(
  <App />,
  // The Modal componenet requires being bound to root element of app.
  // If this root element ever changes, the Modal's root must also be updated
  // You can find the Modal at src/withComponents/SettingsModal/SettingsModal.tsx
  // Modal.setAppElement('#root');
  document.getElementById('root')
);
