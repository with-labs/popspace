import { CssBaseline, MuiThemeProvider, StylesProvider } from '@material-ui/core';
import { NotSupported } from '@src/pages/NotSupported/NotSupported';
import { FlaggProvider } from 'flagg/dist/react';
import * as React from 'react';
import { isMobileOnly } from 'react-device-detect';
import { Router } from 'react-router';

import { SoundEffectProvider } from './components/SoundEffectProvider/SoundEffectProvider';
import { Toaster } from './components/Toaster/Toaster';
import { featureFlags } from './featureFlags';
import history from './history';
import { Routes } from './Routes';
import AppStateProvider from './state';
import { lavender as theme } from './theme/theme';

// import { useCrisp } from './hooks/useCrisp/useCrisp';
export interface IAppProps {}

export const App: React.FC<IAppProps> = () => {
  // TODO: set up analytics identity using whatever user information is available to us

  // setup crisp integration
  // useCrisp();

  return (
    <FlaggProvider featureFlags={featureFlags}>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <Toaster />
          <CssBaseline />
          <Router history={history}>
            {isMobileOnly ? (
              <NotSupported isMobile={isMobileOnly} />
            ) : (
              <AppStateProvider>
                <SoundEffectProvider>
                  <Routes />
                </SoundEffectProvider>
              </AppStateProvider>
            )}
          </Router>
        </MuiThemeProvider>
      </StylesProvider>
    </FlaggProvider>
  );
};
