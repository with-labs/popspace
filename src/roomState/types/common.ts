import { Vector2, Bounds } from '../../types/spatials';

export interface RoomPositionState {
  position: Vector2;
  size: Bounds;
}

export interface RoomDetailsStateShape {
  wallpaperUrl: string;
  isCustomWallpaper: boolean;
  zOrder: string[];
  wallpaperRepeats: boolean;
  backgroundColor: string;
}
