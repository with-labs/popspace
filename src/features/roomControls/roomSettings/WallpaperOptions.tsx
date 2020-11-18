import { WallpaperMetadata } from '../../../constants/WallpaperMetadata';
export interface IWallpaper {
  name: string;
  url: string;
}

const initWallpapers = (wallpaperList: Array<any>) => {
  const options: IWallpaper[] = [];
  const addWallpaper = (name: any) => {
    options.push({
      name: name,
      url: `https://s3-us-west-2.amazonaws.com/with.wallpapers/${name}.jpg`,
    });
  };

  for (const wallpaper of wallpaperList) {
    addWallpaper(wallpaper.name);
  }
  return options;
};

const wallPaperOptions: IWallpaper[] = initWallpapers(WallpaperMetadata);

export { wallPaperOptions };
