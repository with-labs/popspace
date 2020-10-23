import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { useAvatar } from '../../withHooks/useAvatar/useAvatar';
import { makeStyles } from '@material-ui/core';

interface IAvatarProps {
  name: string;
  className?: string;
  size?: number;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
  image: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
}));

export const Avatar: React.FC<IAvatarProps> = ({ name, className, size = 100 }) => {
  const classes = useStyles();

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
      <div className={clsx(classes.root, className)} style={{ width: size, height: size }}>
        <img
          className={classes.image}
          style={{ visibility: isBlinking ? 'visible' : 'hidden' }}
          src={avatar.blink}
          alt="avatar-blink"
        />
        <img
          className={classes.image}
          style={{ visibility: isBlinking ? 'hidden' : 'visible' }}
          src={avatar.image}
          alt="avatar"
        />
      </div>
    );
  }

  return <div></div>;
};
