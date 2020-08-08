import { createMuiTheme } from '@material-ui/core';

const commonSans = {
  fontFamily: 'CommonSans',
  src: `
    url("/fonts/CommonSans-Regular.woff2") format("woff2"),
    url("/fonts/CommonSans-Regular.woff") format("woff")
  `,
};

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    sidebarWidth: number;
  }

  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    sidebarWidth?: number;
  }
}

export default createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: 'rgba(249, 250, 255, 0.6)',
    },
    background: {
      default: 'rgba(249, 250, 255, 0.6)',
    },
  },
  typography: {
    fontFamily: 'CommonSans',
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [commonSans],
      },
    },
  },
  sidebarWidth: 260,
});
