import { DropdownIcon } from '@components/icons/DropdownIcon';
import { createMuiTheme } from '@material-ui/core';
import { PaletteOptions as MuiPaletteOptions } from '@material-ui/core/styles/createPalette';
import React from 'react';

import { ReactComponent as CheckboxChecked } from './images/Checkbox.svg';
import { ReactComponent as CheckboxUnchecked } from './images/Unchecked.svg';
import brandPalette, { WithColorPalette } from './palette';
import { generateShadows } from './shadows';

// adds theme values for lab components
// eslint-disable-next-line unused-imports/no-unused-imports
import type _aug from '@material-ui/lab/themeAugmentation';
const SEMIBOLD_WEIGHT = 600;

function webfontCollection(weight: string) {
  return ['ttf', 'woff2']
    .map((format) => `url("/fonts/manrope-${weight}.${format}") format("${format}")`)
    .join(',\n');
}

const uiFonts = [
  {
    fontFamily: 'Manrope',
    fontWeight: 'normal',
    src: webfontCollection('regular'),
  },
  {
    fontFamily: 'Manrope',
    fontWeight: SEMIBOLD_WEIGHT,
    src: webfontCollection('semibold'),
  },
  {
    fontFamily: 'Manrope',
    fontWeight: 'bold',
    src: webfontCollection('bold'),
  },
  {
    fontFamily: 'Manrope',
    fontWeight: 900,
    src: webfontCollection('extrabold'),
  },
];

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    mainShadows: {
      none: string;
      surface: string;
      modal: string;
    };
    /** Box Shadows which are used to indicate visual focus */
    focusRings: {
      primary: string;
      idle: string;
      create: (color: string, outside?: boolean) => string;
    };
  }

  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    mainShadows?: {
      none: string;
      surface: string;
      modal: string;
    };
    focusRings?: {
      primary: string;
      /** use this focus ring when not focused */
      idle: string;
      create: (color: string, outside?: boolean) => string;
    };
  }
}

declare module '@material-ui/core/styles/shape' {
  interface Shape {
    /**
     * The border radius of content within a surface, usually UI controls,
     * videos, etc
     */
    contentBorderRadius: number;
    /**
     * The border radius of items nested within content, within a surface
     */
    innerBorderRadius: number;
    borderWidth: number;
    surfaceBorderRadius: number;
  }
}

declare module '@material-ui/core/styles/createPalette' {
  interface PaletteOptions {
    brandColors?: typeof brandPalette;
  }

  interface Palette {
    brandColors: typeof brandPalette;
  }
}

declare module '@material-ui/core/styles/createBreakpoints' {
  interface BreakpointOverrides {
    xs: true; // removes the `xs` breakpoint
    sm: true;
    md: true;
    lg: true;
    xl: false; // removes the `xl` breakpoint
  }
}

function toMuiColorPalette(pal: WithColorPalette) {
  return {
    light: pal.light,
    main: pal.regular,
    dark: pal.bold,
    contrastText: pal.ink,
  };
}

function createFocusRing(color: string, outside: boolean = false) {
  return `${!outside ? 'inset ' : ''}0 0 0 2px ${color}`;
}

/**
 *
 * @param colors Color palette configuration
 */
const createPaletteTheme = (colors: { primary: WithColorPalette; secondary?: WithColorPalette }) => {
  const finalPalette: MuiPaletteOptions = {
    // all themes use this grey, for now.
    grey: {
      50: brandPalette.slate.light,
      100: brandPalette.slate.light,
      200: brandPalette.slate.light,
      300: brandPalette.slate.regular,
      400: brandPalette.slate.regular,
      500: brandPalette.slate.regular,
      600: brandPalette.slate.bold,
      700: brandPalette.slate.bold,
      800: brandPalette.slate.ink,
      900: brandPalette.slate.ink,
      A100: brandPalette.slate.light,
      A200: brandPalette.slate.regular,
      A400: brandPalette.slate.bold,
      A700: brandPalette.slate.ink,
    },
    background: {
      default: brandPalette.snow.regular,
      paper: brandPalette.snow.regular,
    },
    text: {
      primary: brandPalette.ink.regular,
      secondary: brandPalette.slate.ink,
    },
    success: toMuiColorPalette(brandPalette.oregano),
    error: toMuiColorPalette(brandPalette.cherry),
    common: {
      white: brandPalette.snow.regular,
      black: brandPalette.ink.regular,
    },
    primary: toMuiColorPalette(colors.primary),
    secondary: toMuiColorPalette(colors.secondary || brandPalette.oregano),
    brandColors: brandPalette,
  };

  // only used to extract some MUI theme tools that can be
  // used in the overrides below, such as computed color palettes and
  // font sizing utils
  const { typography, palette, spacing, transitions, shape, mainShadows, focusRings, zIndex, breakpoints } =
    createMuiTheme({
      palette: finalPalette,
      typography: {
        fontWeightMedium: SEMIBOLD_WEIGHT,
      },
      shape: {
        borderRadius: 6,
        contentBorderRadius: 4,
        innerBorderRadius: 2,
        borderWidth: 2,
        surfaceBorderRadius: 14,
      },
      mainShadows: {
        // an invisible / nonexistent shadow of the same arity as the others, for easing animations
        none: '0 0 0 transparent, 0 0 0 transparent, 0 0 0 transparent, 0 0 0 transparent',
        surface: `0px 45px 89px rgba(0, 0, 0, 0.0185187), 0px 14.27px 26.8309px rgba(0, 0, 0, 0.0225848), 0px 6.11599px 11.1442px rgba(0, 0, 0, 0.0264039), 0px 2.11191px 4.03063px rgba(0, 0, 0, 0.04)`,
        modal: `0px 15px 80px rgba(0, 0, 0, 0.08), 0px 4.52206px 24.1177px rgba(0, 0, 0, 0.0521271), 0px 1.87823px 10.0172px rgba(0, 0, 0, 0.04), 0px 0.67932px 3.62304px rgba(0, 0, 0, 0.0278729)`,
      },
      focusRings: {
        primary: createFocusRing(brandPalette.oregano.bold),
        create: createFocusRing,
        idle: `inset 0 0 0 0 transparent`,
      },
    });

  const finalShadows = generateShadows();
  finalShadows[1] = mainShadows.surface;
  finalShadows[2] = mainShadows.modal;

  return createMuiTheme({
    breakpoints: {
      values: {
        xs: 300,
        sm: 440,
        md: 850,
        // accommodates the entire room controls with all available features and labels in English
        lg: 1080,
      },
    },

    typography: {
      fontFamily: 'Manrope, system-ui, Helvetica, sans-serif',
      fontWeightMedium: SEMIBOLD_WEIGHT,
      body1: {
        lineHeight: 22 / 16,
        fontSize: typography.pxToRem(16),
      },
      body2: {
        fontSize: typography.pxToRem(13),
        lineHeight: 16 / 13,
      },
      caption: {
        fontSize: typography.pxToRem(13),
        lineHeight: 16 / 13,
        color: palette.grey[900],
      },
      h1: {
        fontSize: typography.pxToRem(42),
        lineHeight: 48 / 42,
        fontWeight: typography.fontWeightBold as any,
        color: brandPalette.vintageInk.regular,
      },
      h2: {
        fontSize: typography.pxToRem(24),
        lineHeight: 30 / 24,
        fontWeight: typography.fontWeightMedium as any,
      },
      h3: {
        fontSize: typography.pxToRem(16),
        lineHeight: 22 / 16,
        fontWeight: typography.fontWeightMedium as any,
      },
      h4: {
        fontSize: typography.pxToRem(13),
        lineHeight: 16 / 13,
        fontWeight: typography.fontWeightMedium as any,
      },
      button: {
        fontSize: typography.pxToRem(16),
        fontWeight: typography.fontWeightMedium as any,
        lineHeight: 22 / 16,
        textTransform: 'none',
      },
    },
    shadows: finalShadows,
    mainShadows,
    shape,
    palette: finalPalette,
    focusRings,
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
      MuiFab: {
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
      },
      MuiIconButton: {
        color: 'inherit',
        disableFocusRipple: true,
        disableTouchRipple: true,
        disableRipple: true,
      },
      MuiSvgIcon: {
        fontSize: 'inherit',
        color: 'inherit',
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
        hiddenLabel: true,
      },
      MuiCheckbox: {
        checkedIcon: <CheckboxChecked />,
        icon: <CheckboxUnchecked />,
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
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
        IconComponent: DropdownIcon,
      },
      MuiList: {
        // removes the MUI-style padding at the top and bottom of popover lists
        disablePadding: true,
      },
      MuiListItem: {
        disableGutters: true,
      },
      MuiListItemText: {
        // helpful for customizing the look/feel of regular vs. dense, without
        // fighting the inner typography span
        disableTypography: true,
      },
      MuiPopover: {
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
      MuiMenuItem: {
        disableGutters: true,
      },
      MuiToggleButton: {
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
      },
      MuiTooltip: {
        // delay appearance by 500ms
        enterDelay: 500,
        arrow: true,
      },
      MuiSnackbarContent: {
        elevation: 1,
      },
      MuiAccordion: {
        elevation: 0,
      },
      MuiCircularProgress: {
        thickness: 6,
      },
      MuiCard: {
        elevation: 0,
      },
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          '@font-face': uiFonts,
        },
      },
      MuiFilledInput: {
        root: {
          borderRadius: shape.contentBorderRadius,
          borderTopLeftRadius: shape.contentBorderRadius,
          borderTopRightRadius: shape.contentBorderRadius,

          backgroundColor: palette.grey[50],

          boxShadow: focusRings.idle,
          transition: transitions.create(['box-shadow', 'background-color', 'color', 'caret-color']),

          '&:hover': {
            backgroundColor: palette.grey[100],
          },

          '&$error': {
            backgroundColor: palette.error.light,
          },

          '&:focus, &$focused': {
            boxShadow: focusRings.primary,
            backgroundColor: palette.background.paper,
            caretColor: palette.secondary.contrastText,
            '&$error': {
              boxShadow: focusRings.primary,
              caretColor: palette.error.contrastText,
            },
          },

          '&$disabled': {
            backgroundColor: palette.background.paper,
            boxShadow: focusRings.create(palette.grey[50]),
            color: palette.grey[700],
            opacity: 1,
          },
        },
        input: {
          padding: '14.5px 14px',
          '&:-webkit-autofill': {
            borderRadius: 'inherit',
          },
          '&::placeholder': {
            color: palette.grey[900],
            opacity: 1,
          },
        },
        inputMarginDense: {
          paddingTop: 6,
        },
        inputHiddenLabel: {
          paddingTop: '14.5px',
          paddingBottom: '14.5px',
        },
        multiline: {
          padding: '10px 12px',
        },
      },
      MuiOutlinedInput: {
        inputAdornedEnd: {
          marginRight: spacing(1),
        },
      },
      MuiInputLabel: {
        formControl: {
          position: 'relative',
          transform: 'none',
          fontWeight: 'bold',
          fontSize: typography.pxToRem(13),
          lineHeight: 16 / 13,
          marginBottom: spacing(1),
          color: palette.grey[900],
          '&$error': {
            color: palette.error.contrastText,
          },
          '&$disabled': {
            color: palette.grey[500],
          },
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
          color: palette.grey[900],
          '&$focused': {
            color: palette.secondary.contrastText,
          },
          '&$error': {
            color: palette.error.contrastText,
          },
          '&$disabled': {
            color: palette.grey[500],
          },
        },
      },
      MuiFormHelperText: {
        root: {
          color: palette.grey[900],
          fontSize: typography.caption.fontSize,
          fontWeight: typography.fontWeightBold as any,
          lineHeight: typography.caption.lineHeight,
          '&$focused': {
            color: palette.secondary.contrastText,
          },
          '&$error, &$error$focused': {
            color: palette.error.contrastText,
          },
          '&$disabled': {
            color: palette.grey[500],
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
          borderRadius: shape.contentBorderRadius,
          padding: '13px 24px',
        },
        // ok, pretty inelegant... but necessary right now... MUI is opinionated about variants.
        contained:
          colors.primary === brandPalette.lavender
            ? {
                boxShadow: focusRings.idle,
                backgroundColor: brandPalette.lavender.wash,
                color: brandPalette.lavender.ink,

                transition: transitions.create(['background-color', 'box-shadow', 'color']),

                '&:hover': {
                  boxShadow: focusRings.idle,
                  backgroundColor: brandPalette.lavender.light,
                },

                '&$disabled': {
                  backgroundColor: palette.grey[50],
                  '& > $label': {
                    color: palette.grey[900],
                  },
                },
                '&:focus, &$focusVisible': {
                  backgroundColor: brandPalette.lavender.light,
                  boxShadow: focusRings.create(brandPalette.lavender.bold),
                },
              }
            : {
                boxShadow: focusRings.idle,
                backgroundColor: palette.brandColors.snow.regular,
                transition: transitions.create(['background-color', 'box-shadow', 'color']),
                '&:hover': {
                  boxShadow: focusRings.idle,
                },
                '&$disabled': {
                  backgroundColor: palette.grey[50],
                  '& > $label': {
                    color: palette.grey[900],
                  },
                },
              },
        containedPrimary:
          colors.primary === brandPalette.lavender
            ? {
                backgroundColor: brandPalette.lavender.ink,
                color: brandPalette.snow.regular,
                '&:hover': {
                  backgroundColor: '#7c50da',
                },
                '&:focus, &$focusVisible': {
                  backgroundColor: '#7c50da',
                  boxShadow: focusRings.create('#4b2aaa'),
                },
              }
            : {
                backgroundColor: palette.primary.light,
                '&:hover': {
                  backgroundColor: palette.primary.main,
                },
                '&:focus, &$focusVisible': {
                  boxShadow: focusRings.create(palette.primary.dark),
                },
              },
        containedSecondary: {
          backgroundColor: palette.secondary.light,
          '&:hover': {
            backgroundColor: palette.secondary.main,
          },
          '&:focus, &$focusVisible': {
            backgroundColor: palette.secondary.main,
            boxShadow: focusRings.create(palette.secondary.dark),
          },
        },
        outlined: {
          borderWidth: 2,
        },
        text: {
          padding: '13px 30px',
          '&:focus, &$focusVisible': {
            boxShadow: focusRings.create(palette.secondary.dark),
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          '& $startIcon': {
            marginRight: 4,
          },
          '& $endIcon': {
            marginLeft: 4,
          },
        },
        startIcon: {
          paddingLeft: 0,
          marginLeft: -8,
          marginRight: 8,
        },
        endIcon: {
          paddingRight: 0,
          marginRight: -8,
          marginLeft: 8,
        },
      },
      MuiIconButton: {
        root: {
          boxShadow: focusRings.idle,
          transition: transitions.create(['box-shadow', 'background-color', 'color']),
          padding: spacing(1),

          '&:focus': {
            boxShadow: focusRings.primary,
          },
          '&:active': {
            backgroundColor: palette.grey[50],
          },
          '&:hover': {
            backgroundColor: palette.grey[300],
          },
        },
        sizeSmall: {
          fontSize: typography.pxToRem(16),
          padding: 7,

          '&:focus': {
            boxShadow: focusRings.create(palette.secondary.contrastText),
          },
        },
      },
      MuiCircularProgress: {
        colorPrimary: {
          color: palette.brandColors.slate.ink,
        },
      },
      MuiCheckbox: {
        root: {
          '&$disabled': {
            opacity: 0.5,
          },
          '& svg': {
            // keeps background from bleeding at the corners of the glyph
            borderRadius: 4,
          },
          '&:not(:disabled):hover svg': {
            backgroundColor: palette.grey[50],
          },
          '& input:focus + svg': {
            color: palette.secondary.contrastText,
            backgroundColor: palette.secondary.light,
          },
          '&$checked': {
            color: palette.secondary.contrastText,
          },
        },
        colorSecondary: {
          '&$checked': {
            color: palette.secondary.dark,

            '&:not(:disabled):hover svg': {
              backgroundColor: palette.secondary.light,
            },

            '& input:focus + svg': {
              color: palette.secondary.contrastText,
            },
          },
        },
      },
      MuiMenu: {
        paper: {
          borderRadius: shape.borderRadius,
          padding: spacing(1.5),
          boxShadow: mainShadows.modal,
        },
      },
      MuiMenuItem: {
        root: {
          borderRadius: shape.contentBorderRadius,
          paddingLeft: spacing(1),
          paddingRight: spacing(1),
          boxShadow: focusRings.idle,
          transition: transitions.create(['box-shadow']),
          '& + &': {
            marginTop: spacing(0.5),
          },
          '&$selected, &$selected:hover': {
            fontWeight: typography.fontWeightBold,
            color: palette.secondary.contrastText,
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            '&::after': {
              content: '""',
              width: 18,
              height: 8,
              padding: 2,
              borderBottom: `2px solid ${palette.secondary.contrastText}`,
              borderLeft: `2px solid ${palette.secondary.contrastText}`,
              transform: 'rotate(-48deg) translateY(-4px)',
              marginLeft: 12,
            },
          },
          '&:hover': {
            boxShadow: focusRings.idle,
          },
          '&:focusVisible': {
            boxShadow: focusRings.create(palette.grey[900]),
          },
          '&:active': {
            backgroundColor: palette.grey[500],
          },
        },
      },
      MuiListItem: {
        root: {
          borderRadius: shape.contentBorderRadius,
          paddingLeft: spacing(1),
          paddingRight: spacing(1),

          '&$disabled': {
            opacity: 1,
            color: palette.grey[700],
          },
        },
        button: {
          boxShadow: focusRings.idle,
          transition: transitions.create(['box-shadow']),
          '& + &': {
            marginTop: spacing(0.5),
          },
          '&$selected, &$selected:hover': {
            backgroundColor: palette.grey[50],
          },
          '&:hover, &:focus': {
            boxShadow: focusRings.create(palette.grey[900]),
          },
          '&:active': {
            backgroundColor: palette.grey[500],
          },

          // since there's no prop option to disable ripple, this
          // will have to do
          '& > span[class*=MuiTouchRipple]': {
            display: 'none',
          },
        },
      },
      MuiListItemIcon: {
        root: {
          fontSize: 24,
          minWidth: 24,
          justifyContent: 'center',
          color: 'inherit',
        },
      },
      MuiListItemText: {
        root: {
          fontSize: typography.pxToRem(16),
          lineHeight: 22 / 16,
          fontWeight: typography.fontWeightMedium as any,

          '&:not(:first-child)': {
            marginLeft: spacing(1),
          },
          '&:not(:last-child)': {
            marginRight: spacing(1),
          },
        },
        dense: {
          fontSize: typography.pxToRem(13),
          lineHeight: 16 / 13,
          fontWeight: typography.fontWeightMedium as any,
        },
      },
      MuiListSubheader: {
        root: {
          lineHeight: 1.5,
        },
      },
      MuiSelect: {
        selectMenu: {},
        iconFilled: {
          right: 12,
          fontSize: 24,
          top: 12,
          transition: transitions.create(['transform']),
        },
        filled: {
          // for some reason MUI doubles up on this, so we need to also
          '&$filled': {
            paddingRight: 36,
          },
        },
      },
      MuiPaper: {
        root: {},
        rounded: {
          borderRadius: shape.borderRadius,
        },
        elevation0: {},
        elevation1: {
          boxShadow: mainShadows.surface,
        },
        // we only have 1 elevation
        elevation2: {
          boxShadow: mainShadows.surface,
        },
        elevation3: {
          boxShadow: mainShadows.surface,
        },
        elevation4: {
          boxShadow: mainShadows.surface,
        },
        elevation5: {
          boxShadow: mainShadows.surface,
        },
        // ... should be enough
      },
      MuiLink: {
        root: {
          fontWeight: typography.fontWeightBold as any,
          color: palette.text.primary,

          '&:focus': {
            outlineColor: palette.secondary.dark,
          },
        },
      },
      MuiDivider: {
        root: {
          backgroundColor: palette.grey[50],
          marginTop: spacing(1.5),
          marginBottom: spacing(1.5),
        },
      },
      MuiSnackbar: {
        root: {
          borderRadius: shape.borderRadius,
          textTransform: 'none',
          zIndex: zIndex.snackbar,
          boxShadow: mainShadows.surface,
        },
      },
      MuiSnackbarContent: {
        root: {
          padding: `${spacing(2)}px ${spacing(3)}px`,
          fontSize: typography.pxToRem(16),
          lineHeight: 22 / 16,
          fontWeight: typography.fontWeightMedium as any,
          minWidth: 272,
          backgroundColor: palette.background.paper,
          color: palette.text.primary,
          boxShadow: 'none',
        },
      },
      MuiAlert: {
        root: {
          padding: `${spacing(2)}px ${spacing(3)}px`,
          fontSize: typography.pxToRem(16),
          lineHeight: 22 / 16,
          alignItems: 'center',
        },
        standardInfo: {
          backgroundColor: palette.background.paper,
          color: palette.common.black,
          '& > $icon': {
            color: palette.brandColors.lavender.ink,
          },
        },
        icon: {
          padding: 0,
        },
        message: {
          padding: 0,
          fontWeight: typography.fontWeightMedium as any,
        },
      },
      MuiSlider: {
        rail: {
          backgroundColor: palette.grey[500],
          opacity: 1,
        },
        track: {
          color: palette.brandColors.cherry.bold,
        },
        thumb: {
          backgroundColor: palette.brandColors.cherry.bold,
          boxShadow: `0 0 0 2px ${palette.background.paper}`,
          transition: transitions.create(['box-shadow', 'color']),
          '&:hover': {
            boxShadow: `0 0 0 2px ${palette.brandColors.cherry.ink}`,
          },
          '&:active': {
            backgroundColor: palette.brandColors.cherry.ink,
          },
        },
      },
      MuiTableBody: {
        root: {
          '&> tr:nth-child(odd)': {
            backgroundColor: `${palette.brandColors.sand.regular}`,
          },
        },
      },
      MuiToggleButton: {
        root: {
          height: 48,
          borderWidth: 0,
          color: palette.grey[900],
          backgroundColor: 'transparent',
          padding: 8,
          boxShadow: focusRings.idle,

          transition: transitions.create(['border-color', 'color', 'background-color', 'box-shadow']),

          '&:hover': {
            backgroundColor: palette.grey[300],
          },

          '&:focus': {
            boxShadow: focusRings.primary,
            backgroundColor: palette.grey[50],
          },

          '&:active': {
            boxShadow: focusRings.create(brandPalette.oregano.regular),
            backgroundColor: palette.grey[300],
          },

          '&$selected': {
            color: brandPalette.oregano.regular,
            backgroundColor: 'transparent',

            '& + &': {
              // remove the default conjoining of toggle buttons
              marginLeft: '',
              borderLeft: '',
            },

            '&:hover': {
              boxShadow: focusRings.create(brandPalette.oregano.regular),
              backgroundColor: brandPalette.oregano.regular,
              color: brandPalette.oregano.ink,
            },

            '&:focus': {
              boxShadow: focusRings.primary,
              backgroundColor: brandPalette.oregano.light,
              color: brandPalette.oregano.ink,
            },

            '&:active': {
              boxShadow: focusRings.create(brandPalette.oregano.regular),
              backgroundColor: brandPalette.oregano.light,
              color: brandPalette.oregano.ink,
            },
          },
        },
      },
      MuiDialog: {
        paper: {
          boxShadow: mainShadows.surface,
          borderRadius: shape.surfaceBorderRadius,
        },
        paperFullWidth: {
          [breakpoints.down('sm')]: {
            width: `calc(100% - 32px)`,
            margin: spacing(2),
          },
        },
        paperWidthXs: {
          // this is to support the xs break point option
          // for alert style dialogs, since we currently
          // dont have xs or xl breakpoints
          maxWidth: 360,
        },
      },
      MuiDialogTitle: {
        root: {
          padding: '28px 32px 22px 32px',
          [breakpoints.down('sm')]: {
            padding: '12px 16px 6px 16px',
          },
        },
      },
      MuiDialogContent: {
        root: {
          padding: '0 32px 32px 32px',
          [breakpoints.down('sm')]: {
            padding: '0 16px 16px 16px',
          },
        },
      },
      MuiDialogActions: {
        root: {
          padding: '0 32px 32px 32px',
          [breakpoints.down('sm')]: {
            padding: '0 16px 16px 16px',
            flexDirection: 'column',
            '& > button': {
              width: '100%',
            },
          },
        },
        spacing: {
          [breakpoints.down('sm')]: {
            '& > :not(:first-child)': {
              marginLeft: 'auto',
              marginTop: spacing(0.5),
            },
          },
        },
      },
      MuiDrawer: {
        paper: {
          padding: spacing(1.5),
        },
        paperAnchorBottom: {
          borderTopRightRadius: shape.borderRadius,
          borderTopLeftRadius: shape.borderRadius,
          maxHeight: '90vh',
        },
      },
      MuiSvgIcon: {
        colorError: {
          color: palette.error.dark,
        },
      },
      MuiFab: {
        root: {
          minHeight: 32,
          width: 48,
          height: 48,
          // unlike other buttons, these have a drop shadow so need to use border for focus effect
          border: `2px solid ${palette.background.paper}`,
          borderRadius: shape.borderRadius,
          backgroundColor: palette.background.paper,
          color: palette.grey[900],
          '&:focus, &$focusVisible': {
            borderColor: palette.secondary.dark,
          },
          '&:hover': {
            borderColor: palette.secondary.dark,
            color: palette.secondary.dark,
          },
          '&:active': {
            color: palette.secondary.contrastText,
            backgroundColor: palette.secondary.light,
          },
        },
        sizeSmall: {
          width: 32,
          height: 32,
        },
      },
      MuiTooltip: {
        tooltip: {
          padding: spacing(1.5),
          backgroundColor: palette.background.paper,
          fontSize: typography.pxToRem(16),
          fontWeight: typography.fontWeightRegular as any,
          color: palette.text.primary,
          borderRadius: 4,
          boxShadow: mainShadows.modal,
        },
        arrow: {
          color: palette.background.paper,
        },
      },
      MuiListItemAvatar: {
        root: {
          minWidth: 40,
        },
      },
      MuiSwitch: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          margin: spacing(1),
        },
        colorSecondary: {
          '&$checked': {
            '& + $track': {
              backgroundColor: palette.brandColors.snow.regular,
              opacity: 1,
            },
          },
          '&$disabled + $track': {
            backgroundColor: palette.grey[50],
            opacity: 1,
            border: `1px solid ${palette.grey[50]}`,
          },
          '&$disabled': {
            color: palette.grey[700],
            opacity: 1,
          },
        },
        switchBase: {
          padding: 1,
          '&$checked': {
            transform: 'translateX(16px)',
            '& + $track': {
              border: `1px solid ${palette.success.main}`,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 14,
          border: `1px solid ${palette.grey[400]}`,
          backgroundColor: palette.brandColors.snow.regular,
          opacity: 1,
          transition: transitions.create(['background-color', 'border']),
        },
      },
      MuiAccordion: {
        root: {
          // disable line between collapsed accordion sections
          '&::before': {
            display: 'none',
          },
          '&$expanded': {
            backgroundColor: brandPalette.snow.regular,
            margin: `${spacing(1)}px 0`,
            boxShadow: focusRings.create(brandPalette.lavender.bold),
          },
        },
        rounded: {
          borderRadius: shape.borderRadius,
          backgroundColor: brandPalette.lavender.wash,
          border: 'none',
          margin: `${spacing(1)}px 0`,
          '&$disabled': {
            backgroundColor: brandPalette.lavender.wash,
          },
        },
      },
      MuiAccordionDetails: {
        root: {
          fontSize: typography.pxToRem(16),
        },
      },
      MuiAccordionSummary: {
        root: {
          '&$expanded': {
            minHeight: 24,
          },
          '&$disabled': {
            color: palette.common.black,
            opacity: 1,
          },
        },
        content: {
          margin: `${spacing(1.5)}px 0`,
          '&$expanded': {
            margin: `${spacing(1.5)}px 0 0 0`,
          },
        },
      },
      MuiCard: {
        root: {
          overflow: 'visible',
          backgroundColor: brandPalette.lavender.wash,
          '&:hover': {
            outline: 'none',
          },
        },
      },
      MuiCardActionArea: {
        root: {
          overflow: 'hidden',
          borderRadius: 'inherit',
          transition: transitions.create(['box-shadow', 'background-color']),
          transform: 'scale(1)',
          boxShadow: mainShadows.none,
          backgroundColor: brandPalette.lavender.wash,
          '&$focusVisible, &:focus': {
            boxShadow: `0 0 0 4px ${brandPalette.lavender.bold}`,
          },
          '&:hover': {
            boxShadow: `0 0 0 4px ${brandPalette.lavender.bold}`,
          },
          '&:active': {
            backgroundColor: brandPalette.snow.regular,
            boxShadow: `0 0 0 4px ${brandPalette.lavender.bold}`,
          },
        },
        focusHighlight: {
          display: 'none',
        },
      },
      MuiCardMedia: {
        root: {
          '& > img': {
            padding: '0 !important',
          },
        },
      },
      MuiBackdrop: {
        root: {
          // has to override inline style :(
          backgroundColor: 'rgba(58%, 61.2%, 72.9%, 0.4) !important',
        },
      },
      MuiTab: {
        root: {
          marginBottom: spacing(1),
          textTransform: 'initial',
          display: 'block',
          '&:hover': {
            background: brandPalette.slate.light,
            opacity: 1,
            textTransform: 'initial',
          },
          '&$selected': {
            background: brandPalette.slate.light,
            borderRadius: shape.contentBorderRadius,
          },
        },
        labelIcon: {
          minHeight: 48,
          '& svg': {
            [breakpoints.up('md')]: {
              height: spacing(3),
              width: spacing(3),
              marginRight: 12,
              // couldnt really figure out how to override this
              // the nice way, so I broke out the hammer :V
              marginBottom: `0 !important`,
            },
          },
        },
        wrapper: {
          [breakpoints.up('md')]: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'left',
          },
        },
        textColorInherit: {
          opacity: 1,
        },
      },
      MuiRadio: {
        colorPrimary: {
          '&$checked': {
            color: palette.primary.dark,
          },
        },
      },
      MuiSkeleton: {
        rect: {
          borderRadius: shape.contentBorderRadius,
        },
      },
    },
  });
};

// eslint-disable-next-line no-shadow
export enum ThemeName {
  Mandarin = 'mandarin',
  Cherry = 'cherry',
  Oregano = 'oregano',
  Lavender = 'lavender',
  Snow = 'snow',
  Blueberry = 'blueberry',
  Slate = 'slate',
  VintageInk = 'vintageInk',
}

// kind of arbitrary color combos below...
export const mandarin = createPaletteTheme({
  primary: brandPalette.mandarin,
});

export const cherry = createPaletteTheme({
  primary: brandPalette.cherry,
});

export const lavender = createPaletteTheme({
  primary: brandPalette.lavender,
});

export const oregano = createPaletteTheme({
  primary: brandPalette.oregano,
});

export const snow = createPaletteTheme({
  primary: brandPalette.snow,
});

export const slate = createPaletteTheme({
  primary: brandPalette.slate,
});

export const blueberry = createPaletteTheme({
  primary: brandPalette.blueberry,
});

export const vintageInk = createPaletteTheme({
  primary: brandPalette.vintageInk,
});

export const getThemeFromName = (themeName: ThemeName | undefined) => {
  switch (themeName) {
    case ThemeName.Mandarin:
      return mandarin;
    case ThemeName.Cherry:
      return cherry;
    case ThemeName.Oregano:
      return oregano;
    case ThemeName.Lavender:
      return lavender;
    case ThemeName.Snow:
      return snow;
    case ThemeName.Blueberry:
      return blueberry;
    case ThemeName.VintageInk:
      return vintageInk;
    default:
      return mandarin;
  }
};
