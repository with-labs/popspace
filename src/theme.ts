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

declare module '@material-ui/core/styles/createBreakpoints' {
  interface BreakpointOverrides {
    xs: false; // removes the `xs` breakpoint
    sm: true;
    md: true;
    lg: true;
    xl: false; // removes the `xl` breakpoint
  }
}

export default createMuiTheme({
  breakpoints: {
    values: {
      sm: 0,
      md: 640,
      lg: 960,
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
    MuiOutlinedInput: {
      root: {
        height: '48px',
        borderRadius: 6,
        borderWidth: 2,
        position: 'relative',
        backgroundColor: 'var(--color-snow)',
        '& $notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.23)',
          borderWidth: 2,
        },
        '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
          borderColor: 'var(--color-slate-regular)',
          borderWidth: 2,
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            borderColor: 'var(--color-slate-regular)',
            borderWidth: 2,
          },
        },
        '&$focused $notchedOutline': {
          borderColor: 'var(--color-turquoise-bold)',
          borderWidth: 2,
        },
        '&$error': {
          borderColor: 'var(--color-cherry-bold)',
          borderWidth: 2,
        },
      },
    },
    MuiFormLabel: {
      root: {
        '&$focused': {
          color: 'var(--color-turquoise-bold)',
        },
        '&$error': {
          color: 'var(--color-cherry-bold)',
        },
      },
    },
    MuiButton: {
      root: {
        borderRadius: '6px',
      },
    },
    MuiCircularProgress: {
      colorPrimary: {
        color: 'var(--color-lavender-bold)',
      },
    },
  },
});
