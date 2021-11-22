import { CircularProgress, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AvatarAnimationState, AvatarAnimator, AvatarSpriteSheetSet } from './AvatarAnimator';
import { avatarSpriteSheetCache } from './avatarSpriteSheetCache';

export interface IAvatarProps {
  name: string;
  className?: string;
  size?: number | string;
  animation?: AvatarAnimationState;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  canvasAspectContainer: {
    bottom: 0,
    width: '100%',
  },
  loader: {
    margin: 'auto',
  },
}));

export const Avatar: React.FC<IAvatarProps> = ({ name, className, size, animation = AvatarAnimationState.Idle }) => {
  const classes = useStyles();

  const [spritesheet, setSpritesheet] = useState<AvatarSpriteSheetSet | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const abortController = new AbortController();
    avatarSpriteSheetCache.get(name, abortController.signal).then(setSpritesheet).catch(setError);
    return () => {
      abortController.abort();
    };
  }, [name]);

  const ref = useRef<HTMLCanvasElement>(null);
  const [animator, setAnimator] = useState<AvatarAnimator | null>(null);

  useEffect(() => {
    if (!ref.current || !spritesheet) return;

    const animator = new AvatarAnimator(ref.current, spritesheet);

    animator.start();
    setAnimator(animator);

    return () => {
      animator.stop();
    };
  }, [spritesheet]);

  useEffect(() => {
    animator?.setState(animation);
  }, [animation, animator]);

  const canvasAspectPadding = useMemo(() => {
    const rect = animator?.activeFrame.frame;
    if (!rect) {
      return '100%';
    }
    const aspect = rect.w / rect.h;
    return `${(1 / aspect) * 100}%`;
  }, [animator]);

  // Use two img tags and toggle visibility on them so that both images are fetched and cached by the browser
  // Using visibility:hidden on avatar images will cause the browser to fetch the blink image before it's needed,
  // thus preventing a flash during asset fetching. Attempting to use display:none was tempting, however some
  // browsers will still not fetch an image until it is rendered (Firefox, at least.)
  return (
    <div className={clsx(classes.root, className)} style={size ? { width: size } : undefined}>
      <div className={classes.canvasAspectContainer} style={{ paddingBottom: canvasAspectPadding }}>
        <canvas ref={ref} className={classes.canvas} />
      </div>
      {!spritesheet && !error && <CircularProgress style={{ margin: 'auto', marginBottom: 8, marginTop: 8 }} />}
      {/* TODO: fallback when sprite fails to load */}
    </div>
  );
};
