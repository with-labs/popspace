import React from 'react';
import { cherry, lavender, mandarin, turquoise } from '../src/theme/theme';
import { withMuiTheme } from '@harelpls/storybook-addon-materialui';
import '../src/i18n';

// all our necessary contexts
import { withVideo } from './__decorators__/withVideo';
import { SnackbarProvider } from 'notistack';
import { HashRouter } from 'react-router-dom';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

function withSnackbars(Story) {
  return (
    <SnackbarProvider>
      <Story />
    </SnackbarProvider>
  );
}

function withRouter(Story) {
  return (
    <HashRouter>
      <Story />
    </HashRouter>
  );
}

export const decorators = [
  withMuiTheme({
    mandarin,
    cherry,
    turquoise,
    lavender,
  }),
  withRouter,
  withSnackbars,
  withVideo,
];
