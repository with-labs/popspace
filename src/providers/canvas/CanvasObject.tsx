import { makeStyles } from '@material-ui/core';
import useMergedRef from '@react-hook/merged-ref';
import { animated, SpringValue, to } from '@react-spring/web';
import clsx from 'clsx';
import * as React from 'react';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';
import { Bounds, Vector2 } from '../../types/spatials';
import { CanvasObjectKind } from './Canvas';
import { useCanvas } from './CanvasProvider';
import { useCanvasObjectDrag } from './useCanvasObjectDrag';
import { useCanvasObjectMeasurement } from './useCanvasObjectMeasurement';

const TOP_LEFT_ORIGIN = {
  vertical: 0,
  horizontal: 0,
};

export interface ICanvasObjectProps {
  objectId: string;
  objectKind: CanvasObjectKind;
  /**
   * Optionally, provide a custom z-index for ordering the object
   */
  zIndex?: number;
  className?: string;
  /**
   * Apply a CSS class to the inner content sizing element which is the direct
   * parent of any children.
   */
  contentClassName?: string;
  /**
   * Optionally, you can customize how the object positions itself
   * relative to its position coordinate value. Values are 0-1.0,
   * representing percentages.
   */
  origin?: {
    vertical: number;
    horizontal: number;
  };
  onDragStart?: () => void;
  onDragEnd?: () => void;
  style?: React.CSSProperties;
}

const stopPropagation = (ev: React.MouseEvent | React.PointerEvent | React.KeyboardEvent) => {
  ev.stopPropagation();
  ev.nativeEvent.stopImmediatePropagation();
  ev.nativeEvent.stopPropagation();
};

const preventDefault = (ev: any) => {
  ev.preventDefault();
};

const useStyles = makeStyles({
  root: {
    '&&': {
      position: 'absolute',
      touchAction: 'none',
      willChange: 'transform',
    },
  },
  unmeasuredContentSizer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  measuredContentSizer: {
    width: '100%',
    height: '100%',
  },
});

export const CanvasObjectContext = React.createContext<{
  dragHandleProps: ReactEventHandlers;
  isDraggingAnimatedValue: SpringValue<boolean>;
  objectId: string;
  objectKind: CanvasObjectKind;
  getSize: () => Bounds | null;
  getPosition: () => Vector2;
}>({
  dragHandleProps: {},
  isDraggingAnimatedValue: null as any,
  objectId: '',
  objectKind: 'other',
  getSize: () => null,
  getPosition: () => ({ x: 0, y: 0 }),
});

export function useCanvasObject() {
  const ctx = React.useContext(CanvasObjectContext);
  if (!ctx) {
    throw new Error('useCanvasObject must be called inside a CanvasObject');
  }
  return ctx;
}

/**
 * Provides an implementation of a Canvas content object which utilizes
 * the movement and resizing behaviors of its parent Canvas. CanvasObject
 * is generic enough to be portable between Canvas implementations.
 */
export const CanvasObject: React.FC<ICanvasObjectProps> = ({
  objectId,
  objectKind,
  onDragEnd,
  onDragStart,
  className,
  zIndex,
  children,
  origin = TOP_LEFT_ORIGIN,
  style,
  ...rest
}) => {
  const styles = useStyles();
  const canvas = useCanvas();

  const dragRef = React.useRef<HTMLDivElement>(null);

  const measureRef = useCanvasObjectMeasurement(objectId, objectKind);

  const { style: dragStyle, bindDragHandle } = useCanvasObjectDrag({
    ref: dragRef,
    objectId,
    objectKind,
    onDragEnd,
    onDragStart,
  });

  const ctx = React.useMemo(
    () => ({
      dragHandleProps: bindDragHandle(),
      isDraggingAnimatedValue: dragStyle.grabbing,
      objectKind,
      objectId,
      getSize: () => canvas.getSize(objectId, objectKind),
      getPosition: () => canvas.getPosition(objectId, objectKind),
    }),
    [bindDragHandle, dragStyle.grabbing, objectId, objectKind, canvas]
  );

  const ref = useMergedRef(dragRef, measureRef);

  return (
    <CanvasObjectContext.Provider value={ctx}>
      <animated.div
        ref={ref}
        style={{
          ...style,
          transform: to(
            [dragStyle.x, dragStyle.y],
            (xv, yv) =>
              `translate(${xv}px, ${yv}px) translate(${-origin.horizontal * 100}%, ${-origin.vertical * 100}%)`
          ),
          zIndex: zIndex as any,
          cursor: dragStyle.grabbing.to((isGrabbing) => (isGrabbing ? 'grab' : 'inherit')),
        }}
        className={clsx(styles.root, className)}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
        onPointerDown={stopPropagation}
        onPointerUp={stopPropagation}
        onPointerMove={stopPropagation}
        onDragStart={preventDefault}
        onDrag={preventDefault}
        onDragEnd={preventDefault}
        id={`${objectKind}-${objectId}`}
        {...rest}
      >
        {children}
      </animated.div>
    </CanvasObjectContext.Provider>
  );
};
