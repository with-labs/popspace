import React from 'react';
import { cherry, lavender, mandarin, turquoise } from '../src/theme/theme';
import { withMuiTheme } from '@harelpls/storybook-addon-materialui';
import '../src/i18n';

// all our necessary contexts
import { Provider } from 'react-redux';
import { createStore } from '../src/roomState/store';
import { CoordinatedDispatchProvider } from '../src/features/room/CoordinatedDispatchProvider';
import { withVideo } from './__decorators__/withVideo';
import { SnackbarProvider } from 'notistack';
import { HashRouter } from 'react-router-dom';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

const store = createStore({
  userId: 'fake',
  roomId: 'fake',
});

function withRedux(Story) {
  return (
    <Provider store={store}>
      <CoordinatedDispatchProvider>
        <Story />
      </CoordinatedDispatchProvider>
    </Provider>
  );
}

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
  withRedux,
  withSnackbars,
  withVideo,
];
