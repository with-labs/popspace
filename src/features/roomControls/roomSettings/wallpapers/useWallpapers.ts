import client from '@api/client';
import { RoomWallpaper } from '@api/roomState/types/common';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import create from 'zustand';
import { combine } from 'zustand/middleware';

// homespun centralized cache and fetching
// for wallpaper data
const useWallpaperCache = create(
  combine({ wallpapers: new Array<RoomWallpaper>() }, (set, get) => ({
    add: (wallpaper: RoomWallpaper) => set({ wallpapers: get().wallpapers.concat([wallpaper]) }),
    addAll: (wallpapers: RoomWallpaper[]) => set({ wallpapers: get().wallpapers.concat(wallpapers) }),
  }))
);
let isFetching = false;

const uploadWallpaper = async (file: File) => {
  const { wallpaper } = await client.wallpapers.uploadWallpaper(file);
  useWallpaperCache.getState().add(wallpaper);
  return wallpaper;
};

export function useWallpapers() {
  const { t } = useTranslation();
  const wallpapers = useWallpaperCache((s) => s.wallpapers);

  useEffect(() => {
    if (wallpapers.length === 0 && !isFetching) {
      isFetching = true;
      (async () => {
        try {
          const { wallpapers } = await client.wallpapers.listWallpapers();
          useWallpaperCache.getState().addAll(wallpapers);
        } catch (e) {
          toast.error(t('error.api.UNEXPECTED.message') as string);
        } finally {
          isFetching = false;
        }
      })();
    }
  }, [wallpapers, t]);

  return [wallpapers, uploadWallpaper] as const;
}
