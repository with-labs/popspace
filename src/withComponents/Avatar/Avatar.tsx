import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { options } from '../AvatarSelect/options';

interface IAvatarProps {
  name: string;
  onClick?: () => void;
}

export const Avatar: React.FC<IAvatarProps> = ({ name, onClick }) => {
  const avatar = options.find(opt => opt.name === name);

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
    const avStyle = {
      backgroundImage: `url(${avatar.image})`,
      backgroundSize: 'cover',
    };

    // Using the background + toggling visibility of img to avoid flashes while the image assets are fetched by the
    // browser. Conditional rendering did not work as well because the browser would have to re-fetch image assets on
    // each blink state change.
    return (
      <div onClick={onClick} className="u-width100Percent u-height100Percent" style={avStyle}>
        <img
          className={clsx('u-height100Percent u-width100Percent', { 'u-displayNone': !isBlinking })}
          src={avatar.blink}
          alt="avatar"
        />
      </div>
    );
  }

  return <div></div>;
};
