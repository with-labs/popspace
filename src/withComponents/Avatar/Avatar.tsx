import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { useAvatar } from '../../withHooks/useAvatar/useAvatar';

interface IAvatarProps {
  name: string;
  onClick?: () => void;
  className?: string;
}

export const Avatar: React.FC<IAvatarProps> = ({ name, onClick, className }) => {
  const avatar = useAvatar(name);

  // State dictating whether the avatar is in a blinking state.
  const [isBlinking, setIsBlinking] = useState(false);

  // Effect to set the blinking state in a somewhat random manner.
  useEffect(() => {
    if (avatar) {
      // Timeout up to 5000ms for non-blinking state. 100ms for blinking state.
      const timeoutMillis = isBlinking ? 100 : Math.floor(Math.random() * 5000);
      const blinkTimeout = setTimeout(() => {
        // Toggle the blinking state.
        setIsBlinking(!isBlinking);
      }, timeoutMillis);
      return () => {
        clearTimeout(blinkTimeout);
      };
    }
  }, [isBlinking, avatar]);

  if (avatar) {
    // Use two img tags and toggle visibility on them so that both images are fetched and cached by the browser
    // Using visibility:hidden on avatar images will cause the browser to fetch the blink image before it's needed,
    // thus preventing a flash during asset fetching. Attempting to use display:none was tempting, however some
    // browsers will still not fetch an image until it is rendered (Firefox, at least.)
    return (
      <div onClick={onClick} className={className}>
        <img
          className={clsx('u-height100Percent u-width100Percent u-positionAbsolute', {
            'u-visibilityHidden': !isBlinking,
          })}
          src={avatar.blink}
          alt="avatar-blink"
        />
        <img
          className={clsx('u-height100Percent u-width100Percent u-positionAbsolute', {
            'u-visibilityHidden': isBlinking,
          })}
          src={avatar.image}
          alt="avatar"
        />
      </div>
    );
  }

  return <div></div>;
};
