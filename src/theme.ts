import { createMuiTheme } from '@material-ui/core';

const geomanist = {
  fontFamily: 'Geomanist',
  src: `
    url("/fonts/geomanist-Regular-webfont.woff2") format("woff2"),
    url("/fonts/geomanist-Regular-webfont.woff") format("woff")
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
    fontFamily: 'Geomanist',
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [geomanist],
      },
    },
  },
  sidebarWidth: 260,
});
