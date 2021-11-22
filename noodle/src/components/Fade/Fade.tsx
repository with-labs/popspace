import { animated, useSpring } from '@react-spring/web';
import * as React from 'react';

export interface IFadeProps {
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
}

export const Fade = React.forwardRef<HTMLDivElement, IFadeProps>(
  ({ open, children, onOpen, onClose, ...rest }, ref) => {
    const style = useSpring({
      from: { opacity: 0 },
      to: { opacity: open ? 1 : 0 },
      onStart: () => {
        if (open) {
          onOpen?.();
        }
      },
      onRest: () => {
        if (!open) {
          onClose?.();
        }
      },
    });

    return (
      <animated.div ref={ref} style={style as any} {...rest}>
        {children}
      </animated.div>
    );
  }
);
