import { useSelector } from 'react-redux';
import { selectors } from '../../features/room/roomSlice';
import { BackgroundName, wallpaperByName } from '../../withComponents/BackgroundPicker/options';

export function useBackgroundUrl() {
  const backgroundState = useSelector(selectors.selectBackground);
  // a bit more complicated than it needs to be... ensuring we always have a fallback URL.
  const backgroundUrl =
    backgroundState.backgroundName === BackgroundName.Custom
      ? backgroundState.customBackgroundUrl
      : wallpaperByName(backgroundState.backgroundName)?.image ?? wallpaperByName(BackgroundName.Bg1)?.image;

  return backgroundUrl!;
}
