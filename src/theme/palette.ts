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
    ink: '#7C4F00',
    bold: '#F1A41D',
    regular: '#FFCD64',
    light: '#FFEAB6',
    surface: '#FFF5DD',
  },
  lavender: {
    ink: '#6259BE',
    bold: '#9993EB',
    regular: '#D2CEF5',
    light: '#EAE8FC',
    surface: '#F3F2FE',
    wash: '#F8F7FE',
  },
  cherry: {
    ink: '#9C2F08',
    bold: '#EE6659',
    regular: '#FCABA0',
    light: '#FFD0C8',
    surface: '#FDEEEC',
  },
  oregano: {
    ink: '#00786D',
    bold: '#70BBB2',
    regular: '#A5E1DA',
    light: '#D4F6F2',
    surface: '#E4FBF8',
  },
  blueberry: {
    ink: '#106CB0',
    bold: '#65B2E2',
    regular: '#BFE0F5',
    light: '#E3F2FC',
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
  dim: {
    // slate bold
    regular: 'rgba(190,195,215,0.7)',
  },
  vintageInk: {
    regular: '#545351',
  },
};

export default palette;
