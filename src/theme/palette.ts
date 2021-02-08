export type WithColorPalette = {
  ink?: string;
  bold?: string;
  regular: string;
  light?: string;
  surface?: string;
};

const palette = {
  slate: {
    light: '#F4F5F8',
    regular: '#E2E5EE',
    bold: '#BEC3D7',
    ink: '#949CBA',
  },
  mandarin: {
    ink: '#624104',
    bold: '#EFA726',
    regular: '#FED07F',
    light: '#FFF0CB',
    surface: '#FFF8E7',
  },
  lavender: {
    ink: '#6B66B1',
    bold: '#938ED8',
    regular: '#CBC7EB',
    light: '#E6E4F9',
    surface: '#F1EFFE',
  },
  cherry: {
    ink: '#A36962',
    bold: '#EB9B95',
    regular: '#FEBEB9',
    light: '#FADFDC',
    surface: '#FFF3F1',
  },
  oregano: {
    ink: '#3A7F75',
    bold: '#71ABA3',
    regular: '#9FD1CA',
    light: '#DAF4F1',
    surface: '#E7F8F5',
  },
  blueberry: {
    ink: '#597F9B',
    bold: '#7CA6C5',
    regular: '#B0D7EF',
    light: '#DAEDF9',
    surface: '#EEF8FF',
  },
  sand: {
    regular: '#fff8f0',
  },
  snow: {
    regular: '#ffffff',
  },
  ink: {
    regular: '#333333',
  },
};

export default palette;
