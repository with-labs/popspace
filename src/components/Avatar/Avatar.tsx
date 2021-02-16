import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { useAvatar } from '../../hooks/useAvatar/useAvatar';
import { makeStyles } from '@material-ui/core';

export interface IAvatarProps {
  name: string;
  className?: string;
  size?: number | string;
  baseImageClassName?: string;
  useFallback?: boolean;
  /** Stop animation and show the avatar in the specified state */
  freeze?: 'eyesOpen' | 'eyesClosed' | false;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
  },
  baseImage: {
    width: '100%',
    marginTop: 'auto',
  },
  image: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
  },
}));

export const Avatar: React.FC<IAvatarProps> = ({
  name,
  className,
  baseImageClassName,
  size,
  useFallback = false,
  freeze = false,
}) => {
  const classes = useStyles();

  const avatar = useAvatar(name);

  // State dictating whether the avatar is in a blinking state.
  const [isBlinking, setIsBlinking] = useState(false);

  // Effect to set the blinking state in a somewhat random manner.
  useEffect(() => {
    if (freeze) {
      setIsBlinking(freeze === 'eyesClosed');
    } else if (avatar) {
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
  }, [isBlinking, avatar, freeze]);

  if (avatar) {
    // Use two img tags and toggle visibility on them so that both images are fetched and cached by the browser
    // Using visibility:hidden on avatar images will cause the browser to fetch the blink image before it's needed,
    // thus preventing a flash during asset fetching. Attempting to use display:none was tempting, however some
    // browsers will still not fetch an image until it is rendered (Firefox, at least.)
    return (
      <div className={clsx(classes.root, className)} style={size ? { width: size } : undefined}>
        <img
          className={clsx(classes.baseImage, baseImageClassName)}
          style={{ visibility: isBlinking ? 'hidden' : 'visible' }}
          src={avatar.image}
          alt="avatar"
        />
        <img
          className={classes.image}
          style={{ visibility: isBlinking ? 'visible' : 'hidden' }}
          src={avatar.blink}
          alt="avatar-blink"
        />
      </div>
    );
  } else if (useFallback && name) {
    // this allows us to pass in an avatar that isn't part of the avatar list while
    // also keeping the same behavior
    return (
      <div className={clsx(classes.root, className)} style={size ? { width: size } : undefined}>
        <img className={clsx(classes.baseImage, baseImageClassName)} src={name} alt="avatar" />
      </div>
    );
  }

  return <div></div>;
};
