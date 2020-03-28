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
      main: '#343A40',
    },
    background: {
      default: '#343A40',
    },
  },
  typography: {
    fontFamily: 'Poppins',
  },
  sidebarWidth: 260,
});
