import { CssBaseline, MuiThemeProvider, StylesProvider } from '@material-ui/core';
import type { Decorator, Preview } from '@storybook/react-vite';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';

import '../src/i18n';
import '../src/with.css';
import { getThemeFromName, ThemeName } from '../src/theme/theme';

const withTheme: Decorator = (Story, context) => (
  <StylesProvider injectFirst>
    <MuiThemeProvider theme={getThemeFromName(context.globals.theme)}>
      <CssBaseline />
      <Story />
    </MuiThemeProvider>
  </StylesProvider>
);

const withRouter: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const preview: Preview = {
  decorators: [withTheme, withRouter],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: Object.values(ThemeName),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: ThemeName.Lavender,
  },
};

export default preview;
