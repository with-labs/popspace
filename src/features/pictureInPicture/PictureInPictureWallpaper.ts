import { RoomStateShape, useRoomStore } from '../../roomState/useRoomStore';
import { PictureInPictureRenderable } from './PictureInPictureRenderable';

const selectWallpaperUrl = (room: RoomStateShape) => room.state.wallpaperUrl;

export class PictureInPictureWallpaper extends PictureInPictureRenderable {
  private image: HTMLImageElement;
  private unsubscribe: () => void;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.image = new Image(this.width, this.height);
    this.image.crossOrigin = 'anonymous';
    this.image.style.objectFit = 'cover';
    this.image.src = selectWallpaperUrl(useRoomStore.getState());

    this.unsubscribe = useRoomStore.subscribe<string>((src) => {
      this.image.src = src;
    }, selectWallpaperUrl);
  }

  render = () => {
    if (!this.image.complete || this.image.naturalHeight === 0) return;
    this.ctx.drawImage(this.image, 0, 0, this.width, this.height);
  };

  dispose = () => {
    this.unsubscribe();
  };
}
