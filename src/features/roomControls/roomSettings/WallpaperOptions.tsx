import { WallpaperMetadata, WallpaperMetadataType } from '@constants/WallpaperMetadata';
export interface IWallpaper {
  name: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  artistName: string;
}

const WALLPAPERS_HOST = `https://s3-us-west-2.amazonaws.com/with.wallpapers`;

const initWallpapers = (wallpaperList: { [key: string]: WallpaperMetadataType[] }) => {
  const options: { [key: string]: IWallpaper[] } = {};

  for (const wallpaperCategory in wallpaperList) {
    const rawMetaData = wallpaperList[wallpaperCategory];
    const wallpapers = [];
    for (const wallpaper of rawMetaData) {
      wallpapers.push({
        name: wallpaper.title,
        url: `${WALLPAPERS_HOST}/${wallpaper.file}.jpg`,
        thumbnailUrl: `${WALLPAPERS_HOST}/${wallpaper.file}_thumb.jpg`,
        title: wallpaper.title,
        artistName: wallpaper.artist.name,
      });
    }
    options[wallpaperCategory] = wallpapers;
  }
  return options;
};

const wallPaperOptions: { [key: string]: IWallpaper[] } = initWallpapers(WallpaperMetadata);

export { wallPaperOptions };
