import { Bounds, Vector2 } from '@src/types/spatials';

export interface RoomPositionState {
  position: Vector2;
  size: Bounds;
}

export interface RoomDetailsStateShape {
  wallpaperUrl: string | null;
  zOrder: string[];
  wallpaperRepeats: boolean;
  backgroundColor: string;
  isAudioGlobal: boolean;
}

export interface RoomWallpaper {
  url: string;
  id: string;
  name: string;
  mimetype: string;
  category: string;
  artistName: string;
  thumbnailUrl: string;
  dominantColor: string;
}
