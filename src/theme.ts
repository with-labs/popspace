import { createMuiTheme } from '@material-ui/core';

const silka = {
  fontFamily: 'Silka',
  src: `
    url("/fonts/silka-regular.woff2") format("woff2"),
    url("/fonts/silka-regular.woff") format("woff"),
    url("/fonts/silka-semibold.woff2") format("woff2"),
    url("/fonts/silka-semibold.woff") format("woff")
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
    fontFamily: 'Silka',
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [silka],
      },
    },
  },
  sidebarWidth: 260,
});
