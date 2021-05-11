import { useEffect, useMemo, useState } from 'react';
import { ResizeObserver } from 'resize-observer';
import { CanvasObjectKind } from './Canvas';
import { useCanvas } from './CanvasProvider';

/**
 * Returns a ref, attach that to an element to report its measurements
 * to the parent SizingContext.
 */
export function useCanvasObjectMeasurement(objectId: string, objectKind: CanvasObjectKind) {
  const canvas = useCanvas();

  const [element, elementRef] = useState<HTMLElement | null>(null);

  const resizeObserver = useMemo(
    () =>
      new ResizeObserver((entries) => {
        canvas.onMeasure(entries[0].contentRect, objectId);
      }),
    [objectId, canvas]
  );

  useEffect(() => {
    if (!element) return;
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [element, resizeObserver]);

  return elementRef;
}
