import { WallpaperMetadata } from '../../../constants/WallpaperMetadata';
export interface IWallpaper {
  name: string;
  url: string;
  thumbnailUrl: string;
}

const WALLPAPERS_HOST = `https://s3-us-west-2.amazonaws.com/with.wallpapers`;

const initWallpapers = (wallpaperList: Array<any>) => {
  const options: IWallpaper[] = [];
  const addWallpaper = (name: any) => {
    options.push({
      name: name,
      url: `${WALLPAPERS_HOST}/${name}.jpg`,
      thumbnailUrl: `${WALLPAPERS_HOST}/${name}_thumb.jpg`,
    });
  };

  for (const wallpaper of wallpaperList) {
    addWallpaper(wallpaper.name);
  }
  return options;
};

const wallPaperOptions: IWallpaper[] = initWallpapers(WallpaperMetadata);

export { wallPaperOptions };
