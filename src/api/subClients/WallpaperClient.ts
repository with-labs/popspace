import { Analytics } from '@analytics/Analytics';
import { EventNames } from '@analytics/constants';
import { ApiCoreClient } from '@api/ApiCoreClient';
import { RoomWallpaper } from '@api/roomState/types/common';
import { IncomingWallpaperUpdatedMessage } from '@api/roomState/types/socketProtocol';

import { ApiSubClient } from './ApiSubClient';

export class WallpaperClient extends ApiSubClient {
  constructor(core: ApiCoreClient) {
    super(core);
    core.socket.on('message:wallpaperUpdated', this.onWallpaperUpdated);
  }

  private onWallpaperUpdated = (message: IncomingWallpaperUpdatedMessage) => {
    this.core.cacheApi.updateRoomWallpaper(message.payload.wallpaper);
  };

  setWallpaper = (wallpaper: RoomWallpaper) => {
    this.core.cacheApi.updateRoomWallpaper(wallpaper);
    this.core.socket.send({
      kind: 'updateWallpaper',
      payload: {
        wallpaperId: wallpaper.id,
      },
    });
    Analytics.trackEvent(EventNames.CHANGED_WALLPAPER, wallpaper.id, {
      roomId: this.core.roomStateStore.getState().id,
      isBuiltIn: wallpaper.category !== 'userUploads',
      category: wallpaper.category,
    });
  };

  uploadWallpaper = async (file: File) => {
    return this.core.request<{ wallpaper: RoomWallpaper }>({
      method: 'POST',
      endpoint: '/upload_wallpaper',
      data: {
        file,
      },
      contentType: 'multipart/form-data',
      service: this.core.SERVICES.api,
    });
  };

  deleteWallpaper = async (wallpaperId: string) => {
    return this.core.post<Record<string, never>>('/delete_wallpaper', { wallpaperId }, this.core.SERVICES.api);
  };

  listWallpapers = async () => {
    return this.core.get<{ wallpapers: RoomWallpaper[] }>('/list_wallpapers', this.core.SERVICES.api);
  };
}
