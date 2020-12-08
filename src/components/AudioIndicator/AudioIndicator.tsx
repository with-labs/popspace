import * as React from 'react';
import { animated, useSpring } from '@react-spring/web';

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

/**
 * Renders an animated "equalizer" visual which indicates if audio is playing
 */
export const AudioIndicator: React.FC<IAudioIndicatorProps> = ({ isActive, isPaused, className, variant = 'flat' }) => {
  const [bar1, setBar1] = useSpring(() => ({
    height: 10,
    y: 3,
    // config: SPRINGS.RESPONSIVE,
  }));
  const [bar2, setBar2] = useSpring(() => ({
    height: 16,
    y: 0,
    // config: SPRINGS.RESPONSIVE,
  }));
  const [bar3, setBar3] = useSpring(() => ({
    height: 6,
    y: 5,
    // config: SPRINGS.RESPONSIVE,
  }));

  React.useEffect(() => {
    if (isActive) {
      if (variant === 'sine') {
        if (isPaused) {
          setBar1({ height: 10, y: 3 });
          setBar2({ height: 16, y: 0 });
          setBar3({ height: 6, y: 5 });
        } else {
          let frame: number = 0;
          let start: DOMHighResTimeStamp;
          const loop = (timestamp: DOMHighResTimeStamp) => {
            if (!start) start = timestamp;
            const elapsed = (timestamp - start) / 400;

            const val1 = convolutedSinMovement(elapsed, Math.PI / 3) * 4 + 4;
            const val2 = convolutedSinMovement(elapsed, Math.PI / 2) * 8 + 5;
            const val3 = convolutedSinMovement(elapsed, Math.PI / 6) * 4 + 4;

            setBar1({ height: val1, y: 8 - val1 / 2 });
            setBar2({ height: val2, y: 8 - val2 / 2 });
            setBar3({ height: val3, y: 8 - val3 / 2 });

            frame = requestAnimationFrame(loop);
          };
          frame = requestAnimationFrame(loop);
          return () => {
            cancelAnimationFrame(frame);
          };
        }
      } else {
        if (isPaused) {
          setBar1({ height: 8, y: 4 });
          setBar2({ height: 12, y: 2 });
          setBar3({ height: 8, y: 4 });
        } else {
          setBar1({ height: 10, y: 3 });
          setBar2({ height: 16, y: 0 });
          setBar3({ height: 10, y: 3 });
        }
      }
    } else {
      setBar1({ height: 2, y: 6 });
      setBar2({ height: 2, y: 6 });
      setBar3({ height: 2, y: 6 });
    }
  }, [isActive, isPaused, setBar1, setBar2, setBar3, variant]);

  return (
    <svg
      version="1.1"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
    >
      <animated.rect x="6" y="6" width="2" height="2" rx="1" style={bar1} />
      <animated.rect x="11" y="6" width="2" height="2" rx="1" style={bar2} />
      <animated.rect x="16" y="6" width="2" height="2" rx="1" style={bar3} />
    </svg>
  );
};
