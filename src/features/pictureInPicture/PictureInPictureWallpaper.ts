import client from '@api/client';
import { RoomStateShape } from '@api/useRoomStore';
import { DEFAULT_ROOM_SIZE } from '@constants/room';
import { Vector2 } from '../../types/spatials';
import { PictureInPictureRenderable } from './PictureInPictureRenderable';

const selectWallpaperUrl = (room: RoomStateShape) => room.state.wallpaperUrl;

// kind of arbitrary, figured out through trial and error.
const WALLPAPER_SCALE = 0.78;
const WALLPAPER_SIZE = WALLPAPER_SCALE * DEFAULT_ROOM_SIZE;

export class PictureInPictureWallpaper extends PictureInPictureRenderable {
  private image: HTMLImageElement;
  private unsubscribe: () => void;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.image = new Image(WALLPAPER_SIZE, WALLPAPER_SIZE);
    this.image.crossOrigin = 'anonymous';
    this.image.style.objectFit = 'cover';
    this.image.src = this.getImgSrc(selectWallpaperUrl(client.roomStateStore.getState()));

    this.unsubscribe = client.roomStateStore.subscribe<string | null>((src) => {
      this.image.src = this.getImgSrc(src);
    }, selectWallpaperUrl);
  }

  render = (userPosition: Vector2) => {
    if (!this.image.complete || this.image.naturalHeight === 0) return;
    this.ctx.filter = 'blur(24px)';
    this.ctx.drawImage(this.image, -WALLPAPER_SIZE / 2 - userPosition.x, -WALLPAPER_SIZE / 2 - userPosition.y);
    this.ctx.filter = 'none';
  };

  dispose = () => {
    this.unsubscribe();
  };
}
