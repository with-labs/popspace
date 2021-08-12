import { useEffect, useState } from 'react';

import { avatarSpriteSheetCache } from './avatarSpriteSheetCache';

export function useAvatarBackgroundColor(avatarName: string) {
  const [backgroundColor, setBackgroundColor] = useState('#fff0df');
  useEffect(() => {
    const controller = new AbortController();
    avatarSpriteSheetCache.get(avatarName, controller.signal).then((data) => {
      if (data) {
        setBackgroundColor(data.backgroundColor);
      }
    });
    return () => {
      controller.abort();
    };
  }, [avatarName]);
  return backgroundColor;
}
