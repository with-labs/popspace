import * as React from 'react';
import { useTransition, animated } from '@react-spring/web';
import { makeStyles } from '@material-ui/core';
import { v4 as uuid } from 'uuid';
import clsx from 'clsx';

export interface IHorizontalCollapseProps {
  /** Optionally supply a key which is unique to the content */
  transitionKey?: string | number | null;
  className?: string;
  contentClassName?: string;
  /** SizeTransition only accepts a singular child */
  children: React.ReactChild | null;
}

function getElementBounds(ref: React.RefObject<HTMLElement> | null) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    setTimeout(() => {
      // using offsetWidth doesn't take transforms into account - which gets around the issue of how
      // elements are scaled according to zoom, but their width should be in native pixel units. In
      // other words, if we use getBoundingClientRect(), we get the fully zoomed "actual" pixel size
      // of the element, but this pixel size will end up getting the zoom applied *again*, leading
      // to an exponentially smaller and smaller size as you zoom out.
      const width = ref?.current?.offsetWidth ?? 0;
      const height = ref?.current?.offsetHeight ?? 0;
      resolve({
        width: width ?? 0,
        height: height ?? 0,
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
export const SizeTransition: React.FC<IHorizontalCollapseProps> = ({
  children,
  className,
  contentClassName,
  transitionKey = uuid(),
}) => {
  const classes = useStyles();
  const outerRef = React.useRef<HTMLDivElement>(null);
  // this holds a ref to the previous contents, and the current ones -
  // we will need to measure both at different times.
  const [refs] = React.useState<Array<React.RefObject<HTMLDivElement>>>(() => [
    // the number of refs here is the number of concurrent
    // transitions this component can render. 4 should be
    // enough unless the content changes very rapidly...
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
  ]);

  const transition = useTransition(children, {
    enter: (_, idx) => async (next) => {
      let ref = refs[idx];
      const { width, height } = await getElementBounds(ref);

      if (width || height) {
        await next({ width, height, opacity: 1, overflow: 'hidden' });
      }
    },
    leave: () => async (next) => {
      // measure incoming replacement - we will animate to the height
      // of the incoming content to make things a bit more seamless instead of 0
      let ref = refs[1];
      const { height } = await getElementBounds(ref);

      await next({ width: 0, height, overflow: 'hidden', opacity: 0 });
    },
    from: { width: 0, height: 0, overflow: 'hidden', opacity: 0 },
    unique: true,
    key: transitionKey,
  });

  return transition((style, contents, { key }, idx) => (
    <animated.div ref={outerRef} className={clsx(classes.outer, className)} style={style as any} key={key}>
      <div className={clsx(classes.inner, contentClassName)} ref={refs[idx]}>
        {contents}
      </div>
    </animated.div>
  ));
};
