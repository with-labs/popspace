import * as React from 'react';
import { StylesProvider, MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { mandarin as theme } from './theme/theme';
import { Router } from 'react-router';
import AppStateProvider from './state';
import { Routes } from './Routes';
import { useAnalyticsUserIdentity } from './hooks/useAnalyticsUserIdentity/useAnalyticsUserIdentity';
import { FlaggProvider } from 'flagg/dist/react';
import { featureFlags } from './featureFlags';
import { ReactQueryCacheProvider } from 'react-query';
import { queryCache } from './queryCache';
import history from './history';
import { MediaReadinessProvider } from './components/MediaReadinessProvider/MediaReadinessProvider';
import { SoundEffectProvider } from './components/SoundEffectProvider/SoundEffectProvider';
import { Toaster } from './components/Toaster/Toaster';

export interface IAppProps {}

export const App: React.FC<IAppProps> = () => {
  // on load, if the user is logged in, identify them to various
  // tooling
  useAnalyticsUserIdentity();

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
                    <SoundEffectProvider>
                      <Routes />
                    </SoundEffectProvider>
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
