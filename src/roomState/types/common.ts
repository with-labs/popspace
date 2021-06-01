import { Vector2, Bounds } from '../../types/spatials';

export interface RoomPositionState {
  position: Vector2;
  size: Bounds;
}

export interface RoomDetailsStateShape {
  wallpaperUrl: string;
  isCustomWallpaper: boolean;
  width: number;
  height: number;
  displayName: string;
  zOrder: string[];
  wallpaperRepeats: boolean;
}
