export type WithColorPalette = {
  light?: string;
  regular: string;
  bold?: string;
  ink?: string;
};

const palette = {
  slate: {
    light: '#F4F5F8',
    regular: '#E2E5EE',
    bold: '#BEC3D7',
    ink: '#949CBA',
  },
  mandarin: {
    light: '#FFE5A1',
    regular: '#FFCB45',
    bold: '#F3A110',
    ink: '#7C4F00',
  },
  lavender: {
    light: '#EEECFF',
    regular: '#D9D6FF',
    bold: '#9F97FF',
    ink: '#544BCB',
  },
  cherry: {
    light: '#FFD5D1',
    regular: '#FFB5AF',
    bold: '#EE6659',
    ink: '#9C2F08',
  },
  oregano: {
    light: '#CDF7F3',
    regular: '#ABF1EA',
    bold: '#6DCBC2',
    ink: '#00786D',
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
