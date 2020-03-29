import { createMuiTheme } from '@material-ui/core';

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
    fontFamily: 'Poppins',
  },
  sidebarWidth: 260,
});
