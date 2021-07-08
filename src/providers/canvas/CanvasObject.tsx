import { makeStyles } from '@material-ui/core';
import { animated, SpringValue, to } from '@react-spring/web';
import { isMiddleClick, isNoClick } from '@utils/mouseButtons';
import clsx from 'clsx';
import * as React from 'react';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';

import { Bounds, Vector2 } from '../../types/spatials';
import { CanvasObjectKind } from './Canvas';
import { useCanvas } from './CanvasProvider';
import { useCanvasObjectDrag } from './useCanvasObjectDrag';
import { useCanvasObjectResize } from './useCanvasObjectResize';
import { useMediaGroup } from './useMediaGroup';
import { useSyncLocalMediaGroup } from './useSyncLocalMediaGroup';

export interface ICanvasObjectProps {
  objectId: string;
  objectKind: CanvasObjectKind;
  /**
   * Optionally, provide a custom z-index for ordering the object
   */
  zIndex?: number;
  className?: string;
  /**
   * Apply a CSS class when the user is dragging the object
   */
  contentClassName?: string;
  origin?: 'center' | 'top-left';
  onDragStart?: () => void;
  onDragEnd?: () => void;
  style?: React.CSSProperties;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  preserveAspect?: boolean;
  resizeDisabled?: boolean;
}

const stopPointerPropagation = (ev: React.MouseEvent | React.PointerEvent) => {
  // allow middle click operations to reach viewport
  if (isMiddleClick(ev)) return;
  // allow non-click events to reach viewport
  if (isNoClick(ev)) return;
  ev.stopPropagation();
  ev.nativeEvent.stopImmediatePropagation();
  ev.nativeEvent.stopPropagation();
};

const stopKeyboardPropagation = (ev: React.KeyboardEvent) => {
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
  isGrabbing: boolean;
  objectId: string;
  objectKind: CanvasObjectKind;
  getSize: () => Bounds;
  getPosition: () => Vector2;
  resizeHandleProps: ReactEventHandlers;
  isResizingAnimatedValue: SpringValue<boolean>;
  resizeDisabled: boolean;
  resize: (newSize: Bounds, resetAspectRatio?: boolean) => void;
  mediaGroup: string | null;
}>({
  dragHandleProps: {},
  isGrabbing: false,
  objectId: '',
  objectKind: 'other',
  getSize: () => ({ width: 100, height: 100 }),
  getPosition: () => ({ x: 0, y: 0 }),
  resizeHandleProps: {},
  isResizingAnimatedValue: null as any,
  resizeDisabled: false,
  resize: () => {},
  mediaGroup: null,
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
  origin = 'top-left',
  style,
  minWidth = 100,
  minHeight = 100,
  maxWidth = 10000,
  maxHeight = 10000,
  preserveAspect = false,
  resizeDisabled = false,
  ...rest
}) => {
  const styles = useStyles();
  const canvas = useCanvas();

  const dragRef = React.useRef<HTMLDivElement>(null);

  const {
    style: dragStyle,
    bindDragHandle,
    pickupSpring,
    isGrabbing,
  } = useCanvasObjectDrag({
    ref: dragRef,
    objectId,
    objectKind,
    onDragEnd,
    onDragStart,
  });

  const resizeInfo = React.useMemo(
    () => ({
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      preserveAspect,
      origin,
    }),
    [maxHeight, maxWidth, minHeight, minWidth, preserveAspect, origin]
  );

  const { style: resizeStyle, bindResizeHandle } = useCanvasObjectResize({
    objectId,
    objectKind,
    resizeInfo,
  });

  const resize = React.useCallback(
    (size: Bounds, resetAspectRatio = false) => {
      canvas.setSize(size, objectId, objectKind, {
        ...resizeInfo,
        preserveAspect: resetAspectRatio ? false : resizeInfo.preserveAspect,
      });
    },
    [canvas, objectId, objectKind, resizeInfo]
  );

  const mediaGroup = useMediaGroup(objectId, objectKind);
  useSyncLocalMediaGroup(objectId, objectKind, mediaGroup);

  const ctx = React.useMemo(
    () => ({
      dragHandleProps: bindDragHandle(),
      isGrabbing,
      objectKind,
      objectId,
      getSize: () => canvas.getSize(objectId, objectKind),
      getPosition: () => canvas.getPosition(objectId, objectKind),
      resizeHandleProps: bindResizeHandle(),
      isResizingAnimatedValue: resizeStyle.resizing,
      resizeDisabled,
      resize,
      mediaGroup,
    }),
    [
      bindDragHandle,
      isGrabbing,
      objectKind,
      objectId,
      bindResizeHandle,
      resizeStyle.resizing,
      resizeDisabled,
      resize,
      mediaGroup,
      canvas,
    ]
  );

  const ref = dragRef;

  return (
    <CanvasObjectContext.Provider value={ctx}>
      <animated.div
        ref={ref}
        style={{
          ...style,
          /**
           * Translate to the correct position, offset by origin,
           * and apply a subtle bouncing scale effect when picked
           * up or dropped.
           */
          transform: to(
            [dragStyle.x, dragStyle.y, pickupSpring.value],
            (xv, yv, grabEffect) => `translate(${xv}px, ${yv}px) scale(${1 + 0.05 * grabEffect})`
          ),
          zIndex: zIndex as any,
          cursor: isGrabbing ? 'grab' : 'inherit',
          width: resizeStyle.width,
          height: resizeStyle.height,
          pointerEvents: resizeStyle.resizing.to((v) => (v ? 'none' : '')) as any,
        }}
        className={clsx(styles.root, className)}
        onKeyDown={stopKeyboardPropagation}
        onKeyUp={stopKeyboardPropagation}
        onPointerDown={stopPointerPropagation}
        onPointerUp={stopPointerPropagation}
        onPointerMove={stopPointerPropagation}
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
