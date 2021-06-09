import { makeStyles } from '@material-ui/core';
import { animated, to, useSpring } from '@react-spring/web';
import * as React from 'react';
import { SPRINGS } from '@constants/springs';
import { Vector2 } from '../../types/spatials';
import { rerasterizeSignal } from './rerasterizeSignal';
import { useViewport } from '../viewport/useViewport';
import { ViewportEventOrigin } from '../viewport/Viewport';

const VIEWPORT_ORIGIN_SPRINGS = {
  control: SPRINGS.QUICK,
  animation: SPRINGS.RELAXED,
  // not actually used, for direct we do immediate:true to disable
  // easing
  direct: SPRINGS.RESPONSIVE,
};

export interface IViewportRendererProps {
  children?: React.ReactNode;
  onZoomChange?: (zoom: number) => void;
}

const useStyles = makeStyles({
  canvas: {
    position: 'absolute',
    transformOrigin: 'center center',
    overflow: 'visible',
    overscrollBehavior: 'none',
  },
});

export const CanvasRenderer: React.FC<IViewportRendererProps> = ({ children, onZoomChange }) => {
  const classes = useStyles();

  const viewport = useViewport();

  // keep track of viewport element size as provided by Viewport class
  const [viewportSize, setViewportSize] = React.useState(viewport.size);
  React.useEffect(() => {
    viewport.on('sizeChanged', setViewportSize);
    return () => void viewport.off('sizeChanged', setViewportSize);
  }, [viewport]);

  // the main spring which controls the Canvas transformation.
  // X/Y position is in World Space - i.e. the coordinate space
  // is not affected by the zoom
  const [{ centerX, centerY }, panSpring] = useSpring(() => ({
    centerX: viewport.center.x,
    centerY: viewport.center.y,
    isPanning: false,
    config: SPRINGS.RELAXED,
  }));
  const [{ zoom }, zoomSpring] = useSpring(() => ({
    zoom: viewport.zoom,
    isZooming: false,
    config: SPRINGS.RELAXED,
  }));

  React.useEffect(() => {
    async function handleCenterChanged(center: Readonly<Vector2>, origin: ViewportEventOrigin) {
      await panSpring.start({
        centerX: center.x,
        centerY: center.y,
        isPanning: true,
        immediate: origin === 'direct',
        config: VIEWPORT_ORIGIN_SPRINGS[origin],
      })[0];
      await panSpring.start({ isPanning: false })[0];
    }
    async function handleZoomChanged(zoomValue: number, origin: ViewportEventOrigin) {
      onZoomChange?.(zoomValue);
      await zoomSpring.start({
        zoom: zoomValue,
        isZooming: true,
        immediate: origin === 'direct',
        config: VIEWPORT_ORIGIN_SPRINGS[origin],
      })[0];
      await zoomSpring.start({ isZooming: false })[0];
      rerasterizeSignal.notify();
    }
    viewport.on('centerChanged', handleCenterChanged);
    viewport.on('zoomChanged', handleZoomChanged);
    return () => {
      viewport.off('centerChanged', handleCenterChanged);
      viewport.off('zoomChanged', handleZoomChanged);
    };
  }, [viewport, panSpring, zoomSpring, onZoomChange]);

  return (
    <animated.div
      className={classes.canvas}
      style={{
        transform: to([centerX, centerY, zoom], (cx, cy, zoomv) => {
          // 1. Translate the center of the canvas to 0,0 (-halfCanvasWidth, -halfCanvasHeight)
          // 2. Translate that center point back to the center of the screen (+viewport.size.width / 2, +viewport.size.height / 2)
          // 3. Scale up (or down) to the specified zoom value
          // 4. Translate the center according to the pan position
          return `translate(${viewportSize.width / 2}px, ${
            viewportSize.height / 2
          }px) scale(${zoomv}, ${zoomv}) translate(${-cx}px, ${-cy}px)`;
        }),
      }}
    >
      {children}
    </animated.div>
  );
};
