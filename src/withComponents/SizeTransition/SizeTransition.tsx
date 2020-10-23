import * as React from 'react';
import { useTransition, animated } from '@react-spring/web';
import { makeStyles } from '@material-ui/core';
import { v4 as uuid } from 'uuid';

export interface IHorizontalCollapseProps {
  /** Optionally supply a key which is unique to the content */
  transitionKey?: string | number | null;
}

function getElementBounds(ref: React.RefObject<HTMLElement>) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    setTimeout(() => {
      const rect = ref.current?.getBoundingClientRect();
      resolve({
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
      });
    });
  });
}

const useStyles = makeStyles({
  outer: {
    position: 'relative',
  },
  inner: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 'auto',
  },
});

/** Animates changes in content horizontal size */
export const SizeTransition: React.FC<IHorizontalCollapseProps> = ({ children, transitionKey = uuid() }) => {
  const classes = useStyles();
  const outerRef = React.useRef<HTMLDivElement>(null);
  // this holds a ref to the previous contents, and the current ones -
  // we will need to measure both at different times.
  const refs = React.useRef<[React.RefObject<HTMLDivElement>, React.RefObject<HTMLDivElement>]>([
    React.createRef(),
    React.createRef(),
  ]);

  const transition = useTransition(children, {
    enter: (_, idx) => async (next) => {
      const ref = refs.current[idx];
      const { width, height } = ref ? await getElementBounds(ref) : { width: 0, height: 0 };

      if (width || height) {
        await next({ width, height, opacity: 1, overflow: 'hidden' });
      }
    },
    leave: (_) => async (next) => {
      await next({ width: 0, height: 0, overflow: 'hidden', opacity: 0 });
    },
    from: { width: 0, height: 0, overflow: 'hidden', opacity: 0 },
    unique: true,
    key: transitionKey,
  });

  return transition((style, contents, { key }, idx) => (
    <animated.div ref={outerRef} className={classes.outer} style={style as any}>
      <div className={classes.inner} ref={refs.current[idx]}>
        {contents}
      </div>
    </animated.div>
  ));
};
