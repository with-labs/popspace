import { IRoomMetaState } from '../../withComponents/RoomMetaProvider/roomMetaReducer';
import { BackgroundName, wallpaperByName } from '../../withComponents/BackgroundPicker/options';

export function useRoomMetaContextBackground(properties: IRoomMetaState): string {
  let backgroundImage = '';

  if (properties.bg) {
    if (properties.bg === BackgroundName.Custom && properties.customBG) {
      backgroundImage = properties.customBG;
    } else {
      const bg = wallpaperByName(properties.bg);
      if (bg) {
        backgroundImage = `url(${bg.image})`;
      }
    }
  }

  return backgroundImage;
}
