import * as React from 'react';
import { animated, useSpring } from '@react-spring/web';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export interface IAudioIndicatorProps {
  isActive: boolean;
  isPaused?: boolean;
  className?: string;
  variant?: 'flat' | 'sine';
}

/**
 * Sinusoidal movement, from 0-1, based on time and with phase offset
 */
function convolutedSinMovement(time: number, phaseOffset: number) {
  const phased = time + phaseOffset;
  const a = Math.cos(phased);
  const b = Math.sin(phased * Math.PI);
  const c = Math.sin(phased * Math.PI * Math.PI);
  return a * b * c * 2 + 0.5;
}

const useStyles = makeStyles({
  root: {
    // the root of the audio animation is composited on a different layer so that its frequent
    // animation repaints will not affect parent layers
    willChange: 'transform',
  },
  bar: {
    height: 16,
    width: 2,
    transformOrigin: 'center',
  },
});

function createTransform(scale: number) {
  return `scaleY(${scale}) translateY(-8px)`;
}

/**
 * Renders an animated "equalizer" visual which indicates if audio is playing
 */
export const AudioIndicator: React.FC<IAudioIndicatorProps> = ({ isActive, isPaused, className, variant = 'flat' }) => {
  const classes = useStyles();

  const [bar1, bar1Ref] = useSpring(() => ({
    transform: createTransform(0.625),
  }));
  const [bar2, bar2Ref] = useSpring(() => ({
    transform: createTransform(1),
  }));
  const [bar3, bar3Ref] = useSpring(() => ({
    transform: createTransform(0.375),
  }));

  React.useEffect(() => {
    if (isActive) {
      if (variant === 'sine') {
        if (isPaused) {
          bar1Ref.start({ transform: createTransform(0.625) });
          bar2Ref.start({ transform: createTransform(1) });
          bar3Ref.start({ transform: createTransform(0.375) });
        } else {
          let frame: number = 0;
          let start: DOMHighResTimeStamp;
          const loop = (timestamp: DOMHighResTimeStamp) => {
            if (!start) start = timestamp;
            const elapsed = (timestamp - start) / 400;

            const val1 = convolutedSinMovement(elapsed, Math.PI / 3) * 4 + 4;
            const val2 = convolutedSinMovement(elapsed, Math.PI / 2) * 8 + 5;
            const val3 = convolutedSinMovement(elapsed, Math.PI / 6) * 4 + 4;

            bar1Ref.start({ transform: createTransform(val1 / 16) });
            bar2Ref.start({ transform: createTransform(val2 / 16) });
            bar3Ref.start({ transform: createTransform(val3 / 16) });

            frame = requestAnimationFrame(loop);
          };
          frame = requestAnimationFrame(loop);
          return () => {
            cancelAnimationFrame(frame);
          };
        }
      } else {
        if (isPaused) {
          bar1Ref.start({ transform: createTransform(0.5) });
          bar2Ref.start({ transform: createTransform(0.75) });
          bar3Ref.start({ transform: createTransform(0.5) });
        } else {
          bar1Ref.start({ transform: createTransform(0.625) });
          bar2Ref.start({ transform: createTransform(1) });
          bar3Ref.start({ transform: createTransform(0.625) });
        }
      }
    } else {
      bar1Ref.start({ transform: createTransform(0.125) });
      bar2Ref.start({ transform: createTransform(0.125) });
      bar3Ref.start({ transform: createTransform(0.125) });
    }
  }, [isActive, isPaused, bar1Ref, bar2Ref, bar3Ref, variant]);

  return (
    <svg
      version="1.1"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={clsx(classes.root, className)}
    >
      <animated.rect className={classes.bar} x="6" y="12" rx="1" style={bar1} />
      <animated.rect className={classes.bar} x="11" y="12" rx="1" style={bar2} />
      <animated.rect className={classes.bar} x="16" y="12" rx="1" style={bar3} />
    </svg>
  );
};
