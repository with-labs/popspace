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
        '& $notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.23)',
        },
        '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
          borderColor: 'var(--color-slate-regular)',
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            borderColor: 'var(--color-slate-regular)',
          },
        },
        '&$focused $notchedOutline': {
          borderColor: 'var(--color-turquoise-bold)',
          borderWidth: 1,
        },
        '&$error': {
          borderColor: 'var(--color-cherry-bold)',
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
  },
});
