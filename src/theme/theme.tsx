import React from 'react';
import { createMuiTheme } from '@material-ui/core';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import brandPalette from './palette';
import { ReactComponent as CheckboxChecked } from './images/Checkbox.svg';
import { ReactComponent as CheckboxUnchecked } from './images/Unchecked.svg';
import { generateShadows } from './shadows';

// adds theme values for lab components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type _aug from '@material-ui/lab/themeAugmentation';

const silka = {
  fontFamily: 'Silka',
  src: `
    url("/fonts/silka-regular.woff2") format("woff2"),
    url("/fonts/silka-regular.woff") format("woff"),
    url("/fonts/silka-semibold.woff2") format("woff2"),
    url("/fonts/silka-semibold.woff") format("woff")
  `,
};

export const mainShadows = {
  surface: `0px 45px 89px rgba(0, 0, 0, 0.0185187), 0px 14.27px 26.8309px rgba(0, 0, 0, 0.0225848), 0px 6.11599px 11.1442px rgba(0, 0, 0, 0.0264039), 0px 2.11191px 4.03063px rgba(0, 0, 0, 0.04)`,
  popover: `0px 15px 80px rgba(0, 0, 0, 0.08), 0px 4.52206px 24.1177px rgba(0, 0, 0, 0.0521271), 0px 1.87823px 10.0172px rgba(0, 0, 0, 0.04), 0px 0.67932px 3.62304px rgba(0, 0, 0, 0.0278729)`,
};

export const cornerRadii = {
  surface: 14,
  content: 6,
  innermost: 2,
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

/**
 *
 * @param colors Color palette configuration
 */
const createPaletteTheme = (colors: PaletteOptions) => {
  const finalPalette: PaletteOptions = {
    // all themes use this grey, for now.
    grey: brandPalette.grey,
    background: {
      default: brandPalette.snow.main,
      paper: brandPalette.snow.main,
    },
    text: {
      primary: brandPalette.ink.main,
    },
    success: brandPalette.turquoise,
    error: brandPalette.cherry,
    common: {
      white: brandPalette.snow.main,
      black: brandPalette.ink.main,
    },
    ...colors,
  };

  // only used to extract some MUI theme tools that can be
  // used in the overrides below, such as computed color palettes and
  // font sizing utils
  const { typography, palette, spacing, transitions } = createMuiTheme({
    palette: finalPalette,
  });

  return createMuiTheme({
    breakpoints: {
      values: {
        sm: 440,
        md: 640,
        lg: 960,
      },
    },

    typography: {
      fontFamily: 'Silka',
    },
    shadows: generateShadows(),
    palette: finalPalette,
    props: {
      MuiButton: {
        // default button is the filled version
        variant: 'contained',
        // default to primary color
        color: 'primary',
        // remove some MUI effects
        disableRipple: true,
        disableTouchRipple: true,
        // default button to take full container width
        fullWidth: true,
      },
      MuiInputLabel: {
        disableAnimation: true,
        shrink: true,
      },
      MuiOutlinedInput: {
        notched: false,
      },
      MuiFilledInput: {
        disableUnderline: true,
      },
      MuiTextField: {
        variant: 'filled',
        fullWidth: true,
      },
      MuiCheckbox: {
        checkedIcon: <CheckboxChecked />,
        icon: <CheckboxUnchecked />,
      },
      MuiSelect: {
        MenuProps: {
          anchorOrigin: {
            horizontal: 'left',
            vertical: 'bottom',
          },
          transformOrigin: {
            vertical: -8,
            horizontal: 'left',
          },
          getContentAnchorEl: null,
        },
      },
      MuiList: {
        // removes the MUI-style padding at the top and bottom of popover lists
        disablePadding: true,
      },
      MuiMenu: {
        getContentAnchorEl: null,
        anchorOrigin: {
          horizontal: 'left',
          vertical: 'bottom',
        },
        transformOrigin: {
          vertical: -8,
          horizontal: 'left',
        },
      },
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          '@font-face': [silka],
        },
      },
      MuiOutlinedInput: {
        root: {
          borderRadius: 6,
          borderWidth: 2,
          position: 'relative',
          backgroundColor: palette.background.paper,
          // disabling hover color change
          '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
            borderWidth: 2,
            borderColor: palette.grey[500],
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
              borderWidth: 2,
              borderColor: palette.grey[500],
            },
          },
          '&$focused': {
            caretColor: brandPalette.turquoise.dark,

            '& $notchedOutline': {
              borderColor: brandPalette.turquoise.dark,
              borderWidth: 2,
            },
          },
          '&$error': {
            borderWidth: 2,
          },
          '&$disabled': {
            backgroundColor: palette.grey[100],
          },
        },
        notchedOutline: {
          borderColor: 'rgba(0, 0, 0, 0.23)',
          borderWidth: 2,
        },
        input: {
          // with text size, equates to 48px height
          padding: '14.5px 14px',
        },
      },
      MuiFilledInput: {
        root: {
          borderRadius: 6,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,

          backgroundColor: brandPalette.grey[50],

          '&:hover': {
            backgroundColor: brandPalette.grey[100],
          },

          '&$error': {
            backgroundColor: brandPalette.cherry.light,
          },
        },
        input: {
          padding: '14.5px 14px',
          '&:-webkit-autofill': {
            borderRadius: 'inherit',
          },
        },
        inputMarginDense: {
          paddingTop: 6,
        },
      },
      MuiInputLabel: {
        formControl: {
          position: 'relative',
          transform: 'none',
          fontWeight: 'bold',
          fontSize: typography.pxToRem(13),
          lineHeight: '16px',
          marginBottom: spacing(1),
        },
        outlined: {
          transform: 'translate3d(0,0,0)',
          '&$shrink': {
            transform: 'translate3d(0,0,0)',
          },
        },
        filled: {
          transform: 'translate3d(0,0,0)',
          '&$shrink': {
            transform: 'translate3d(0,0,0)',
          },
        },
      },
      MuiFormLabel: {
        root: {
          '&$focused': {
            color: brandPalette.turquoise.dark,
          },
        },
      },
      MuiFormHelperText: {
        root: {
          '&$error': {
            fontWeight: 'bold',
          },
        },
      },
      MuiFormControl: {
        marginDense: {
          marginTop: 0,
          marginBottom: spacing(1),
        },
        marginNormal: {
          marginTop: 0,
          marginBottom: spacing(2),
        },
      },
      MuiButton: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
          padding: '16px 30px',
          lineHeight: 1,
          fontWeight: 'bold',
          fontSize: typography.pxToRem(16),
        },
        containedPrimary: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
          '&$disabled': {
            backgroundColor: palette.primary.light,
            '& > $label': {
              color: palette.grey[500],
            },
          },
        },
        outlined: {
          borderWidth: 2,
        },
      },
      MuiCircularProgress: {
        colorPrimary: {
          color: brandPalette.lavender.dark,
        },
      },
      MuiCheckbox: {
        root: {
          '&$disabled': {
            opacity: 0.5,
          },
        },
      },
      MuiMenu: {
        paper: {
          borderRadius: 16,
          padding: spacing(1),
          boxShadow: mainShadows.popover,
        },
      },
      MuiMenuItem: {
        root: {
          borderRadius: 6,
        },
      },
      MuiPaper: {
        root: {},
        rounded: {
          borderRadius: 14,
        },
        elevation1: {
          boxShadow: mainShadows.surface,
        },
      },
      MuiLink: {
        root: {
          fontWeight: 'bold',
          color: palette.text.primary,
        },
      },
      MuiDivider: {
        root: {
          backgroundColor: `${brandPalette.grey[50]}`,
          marginTop: spacing(1.5),
          marginBottom: spacing(1.5),
        },
      },
      MuiListItemIcon: {
        root: {
          minWidth: '40px',
        },
      },
      MuiSnackbar: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
          padding: '16px 30px',
          '& *': {
            lineHeight: 1,
            fontWeight: 'bold',
            fontSize: typography.pxToRem(16),
          },
        },
      },
      MuiSlider: {
        rail: {
          backgroundColor: palette.grey[500],
          opacity: 1,
        },
        thumb: {},
      },
      MuiTableBody: {
        root: {
          '&> tr:nth-child(odd)': {
            backgroundColor: `${brandPalette.sand.main}`,
          },
        },
      },
      MuiToggleButton: {
        root: {
          borderRadius: 6,
          borderWidth: 2,
          color: palette.grey[900],
          borderColor: palette.grey[50],
          backgroundColor: palette.common.white,

          transition: transitions.create(['borderColor', 'color']),

          '&:hover': {
            borderColor: palette.grey[500],
            backgroundColor: palette.common.white,
          },

          '&$selected': {
            color: brandPalette.turquoise.dark,
            borderColor: brandPalette.turquoise.main,
            backgroundColor: palette.common.white,

            '& + &': {
              // remove the default conjoining of toggle buttons
              marginLeft: '',
              borderLeft: '',
            },

            '&:hover': {
              borderColor: brandPalette.turquoise.dark,
              backgroundColor: palette.common.white,
            },
          },
        },
      },
      MuiDialog: {
        paper: {
          boxShadow: mainShadows.surface,
          borderRadius: cornerRadii.surface,
        },
        paperWidthMd: {
          maxWidth: 768,
        },
      },
      MuiDialogTitle: {
        root: {
          padding: '28px 32px 22px 32px',
        },
      },
      MuiDialogContent: {
        root: {
          padding: '0 32px 32px 32px',
        },
      },
    },
  });
};

export enum ThemeName {
  Mandarin = 'mandarin',
  Cherry = 'cherry',
  Turquoise = 'turquoise',
  Lavender = 'lavender',
}

// kind of arbitrary color combos below...
export const mandarin = createPaletteTheme({
  primary: brandPalette.mandarin,
  secondary: brandPalette.turquoise,
  error: {
    main: brandPalette.cherry.dark,
  },
});

export const cherry = createPaletteTheme({
  primary: brandPalette.cherry,
  secondary: brandPalette.lavender,
  error: {
    main: brandPalette.cherry.dark,
  },
});

export const lavender = createPaletteTheme({
  primary: brandPalette.lavender,
  secondary: brandPalette.turquoise,
  error: {
    main: brandPalette.cherry.dark,
  },
});

export const turquoise = createPaletteTheme({
  primary: brandPalette.turquoise,
  secondary: brandPalette.mandarin,
  error: {
    main: brandPalette.cherry.dark,
  },
});
