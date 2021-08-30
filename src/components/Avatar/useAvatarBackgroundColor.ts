import { useEffect, useState } from 'react';

import { avatarSpriteSheetCache } from './avatarSpriteSheetCache';

export function useAvatarBackgroundColor(avatarName: string) {
  const [backgroundColor, setBackgroundColor] = useState('#fff0df');
  useEffect(() => {
    const controller = new AbortController();
    try {
      avatarSpriteSheetCache.get(avatarName, controller.signal).then((data) => {
        if (data) {
          setBackgroundColor(data.backgroundColor);
        }
      });
    } catch (err) {
      // nothing to do here, falling back to default is fine.
    }
    return () => {
      controller.abort();
    };
  }, [avatarName]);
  return backgroundColor;
}
