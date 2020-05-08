export interface IWallpaper {
  name: string;
  image: string;
}

export enum BackgroundName {
  Custom = 'CUSTOM',
  Bg1 = 'BG_1',
  Bg2 = 'BG_2',
  Bg3 = 'BG_3',
  Bg4 = 'BG_4',
  Bg5 = 'BG_5',
  Bg6 = 'BG_6',
  Bg7 = 'BG_7',
  Bg8 = 'BG_8',
}

export const options = [
  { name: BackgroundName.Bg1, image: `${process.env.PUBLIC_URL}/backgrounds/wallpaper01.jpg` },
  { name: BackgroundName.Bg2, image: `${process.env.PUBLIC_URL}/backgrounds/wallpaper02.jpg` },
  { name: BackgroundName.Bg3, image: `${process.env.PUBLIC_URL}/backgrounds/wallpaper03.jpg` },
  { name: BackgroundName.Bg4, image: `${process.env.PUBLIC_URL}/backgrounds/wallpaper04.jpg` },
  { name: BackgroundName.Bg5, image: `${process.env.PUBLIC_URL}/backgrounds/wallpaper05.jpg` },
  { name: BackgroundName.Bg6, image: `${process.env.PUBLIC_URL}/backgrounds/wallpaper06.jpg` },
  { name: BackgroundName.Bg7, image: `${process.env.PUBLIC_URL}/backgrounds/wallpaper07.jpg` },
  { name: BackgroundName.Bg8, image: `${process.env.PUBLIC_URL}/backgrounds/wallpaper08.jpg` },
];

export function wallpaperByName(name: string) {
  return options.find(opt => opt.name === name);
}
