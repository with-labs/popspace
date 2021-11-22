import { useSpring } from '@react-spring/web';
import { useEffect, useMemo } from 'react';
import { useGesture } from 'react-use-gesture';
import { Bounds } from '../../types/spatials';
import { isInBounds } from '@utils/math';
import { useViewport } from '../viewport/useViewport';
import { CanvasObjectKind, ResizeInfo } from './Canvas';
import { useCanvas } from './CanvasProvider';

export function useCanvasObjectResize({
  objectId,
  objectKind,
  resizeInfo: info,
}: {
  objectId: string;
  objectKind: CanvasObjectKind;
  resizeInfo: ResizeInfo;
}) {
  const canvas = useCanvas();
  const viewport = useViewport();

  const initialSize = useMemo(() => canvas.getSize(objectId, objectKind), [canvas, objectId, objectKind]);
  const initialWidth = initialSize?.width ?? info.minWidth ?? 140;
  const initialHeight = initialSize?.height ?? info.minHeight ?? 80;

  const [style, spring] = useSpring(() => ({
    width: initialWidth,
    height: initialHeight,
    resizing: false,
  }));

  // compatability patch: save the defaulted size if there's no measured
  // size in the backend. This might be deletable in the future.
  useEffect(() => {
    if (!initialSize) {
      canvas.onResizeEnd({ width: initialWidth, height: initialHeight }, objectId, objectKind, info);
    } else if (
      !isInBounds(initialSize.width, info.minWidth, info.maxWidth) ||
      !isInBounds(initialSize.height, info.minHeight, info.maxHeight)
    ) {
      // sanity check: if the current dimensions are outside bounds, clamp them to bounds!
      canvas.setSize(initialSize, objectId, objectKind, {
        ...info,
        // reset aspect ratio to the new size
        preserveAspect: false,
      });
    }
  }, [initialSize, canvas, objectId, objectKind, info, initialWidth, initialHeight]);

  // this effect updates the spring dimensions when the size changes
  useEffect(
    () =>
      canvas.observeSize(objectId, objectKind, (size) => {
        if (!size) return;
        spring.start({
          width: size?.width,
          height: size?.height,
          // update dimensions immediately if the user is actively resizing
          immediate: style.resizing.goal,
        });
      }),
    [canvas, objectId, objectKind, spring, style.resizing]
  );

  const bindResizeHandle = useGesture(
    {
      onDrag: (state) => {
        // use case: consider a resizeable container within a draggable container -
        // when the user grabs the resize handle, we want to disable dragging
        state.event?.stopPropagation();

        let deltaX = state.movement[0];
        let deltaY = state.movement[1];

        // for center-origin, we multiply delta by 2 since the object grows in both directions
        if (info.origin === 'center') {
          deltaX *= 2;
          deltaY *= 2;
        }

        const initialSize = state.first ? canvas.getSize(objectId, objectKind) : (state.memo as Bounds);

        const newWidth = initialSize.width + deltaX / viewport.zoom;
        const newHeight = initialSize.height + deltaY / viewport.zoom;

        canvas.onResize(
          {
            width: newWidth,
            height: newHeight,
          },
          objectId,
          objectKind,
          info
        );

        return initialSize;
      },
      onDragStart: (state) => {
        state.event?.stopPropagation();
        spring.start({ resizing: true, immediate: true });
        canvas.onResizeStart(
          {
            width: style.width.goal,
            height: style.height.goal,
          },
          objectId,
          objectKind
        );
      },
      onDragEnd: (state) => {
        state.event?.stopPropagation();
        spring.start({ resizing: false, immediate: true });
        // report change to parent
        canvas.onResizeEnd(
          {
            width: style.width.goal,
            height: style.height.goal,
          },
          objectId,
          objectKind,
          info
        );
      },
    },
    {
      eventOptions: { capture: false },
    }
  );

  return { style, bindResizeHandle };
}
