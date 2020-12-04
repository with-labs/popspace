import * as React from 'react';
import { makeStyles, StylesProvider, MuiThemeProvider, CssBaseline } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { mandarin as theme } from './theme/theme';
import { Router } from 'react-router';
import AppStateProvider from './state';
import { Routes } from './Routes';
import { useAnalyticsUserIdentity } from './hooks/useAnalyticsUserIdentity/useAnalyticsUserIdentity';
import { FlaggProvider } from 'flagg/dist/react';
import { featureFlags } from './featureFlags';
import { ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { queryCache } from './queryCache';
import history from './history';
import { MediaReadinessProvider } from './components/MediaReadinessProvider/MediaReadinessProvider';

export interface IAppProps {}

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
  snackBarFonts: {
    lineHeight: themeObj.typography.h3.lineHeight,
    fontWeight: themeObj.typography.h3.fontWeight,
    fontSize: themeObj.typography.h3.fontSize,
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
      className={styles.snackBarFonts}
    >
      {children}
    </SnackbarProvider>
  );
};

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
              <SnackbarWrapper>
                <CssBaseline />
                <Router history={history}>
                  <AppStateProvider>
                    <MediaReadinessProvider>
                      <Routes />
                    </MediaReadinessProvider>
                  </AppStateProvider>
                </Router>
              </SnackbarWrapper>
            </MuiThemeProvider>
          </StylesProvider>
        </FlaggProvider>
      </ReactQueryCacheProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};
