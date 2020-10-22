import React from 'react';
import { cherry, lavender, mandarin, turquoise } from '../src/theme/theme';
import { withMuiTheme } from '@harelpls/storybook-addon-materialui';

// all our necessary contexts
import { Provider } from 'react-redux';
import store from '../src/state/store';
import { CoordinatedDispatchProvider } from '../src/features/room/CoordinatedDispatchProvider';
import { withVideo } from './__decorators__/withVideo';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

function withRedux(Story) {
  return (
    <Provider store={store}>
      <CoordinatedDispatchProvider>
        <Story />
      </CoordinatedDispatchProvider>
    </Provider>
  );
}

function withLocalParticipant(Story) {
  return <Story />;
}

export const decorators = [
  withMuiTheme({
    mandarin,
    cherry,
    turquoise,
    lavender,
  }),
  withRedux,
  withVideo,
];
