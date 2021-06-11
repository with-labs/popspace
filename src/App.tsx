import * as React from 'react';
import { StylesProvider, MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { mandarin as theme } from './theme/theme';
import { Router } from 'react-router';
import AppStateProvider from './state';
import { Routes } from './Routes';
import { FlaggProvider } from 'flagg/dist/react';
import { featureFlags } from './featureFlags';
import { ReactQueryCacheProvider } from 'react-query';
import { queryCache } from './queryCache';
import history from './history';
import { MediaReadinessProvider } from './components/MediaReadinessProvider/MediaReadinessProvider';
import { SoundEffectProvider } from './components/SoundEffectProvider/SoundEffectProvider';
import { Toaster } from './components/Toaster/Toaster';
import { useCrisp } from './hooks/useCrisp/useCrisp';
import { isMobileOnly } from 'react-device-detect';

import { NotSupported } from '@src/pages/NotSupported/NotSupported';

export interface IAppProps {}

export const App: React.FC<IAppProps> = () => {
  // TODO: set up analytics identity using whatever user information is available to us

  // setup crisp inegration
  useCrisp();

  return (
    <>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <FlaggProvider featureFlags={featureFlags}>
          <StylesProvider injectFirst>
            <MuiThemeProvider theme={theme}>
              <Toaster />
              <CssBaseline />
              <Router history={history}>
                <AppStateProvider>
                  <MediaReadinessProvider>
                    <SoundEffectProvider>{isMobileOnly ? <NotSupported /> : <Routes />}</SoundEffectProvider>
                  </MediaReadinessProvider>
                </AppStateProvider>
              </Router>
            </MuiThemeProvider>
          </StylesProvider>
        </FlaggProvider>
      </ReactQueryCacheProvider>
    </>
  );
};
