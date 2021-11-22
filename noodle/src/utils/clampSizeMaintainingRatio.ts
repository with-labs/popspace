import { clamp } from './math';

/**
 * Clamps the size of a set of dimensions (w/h) between
 * provided min and max dimensions, while enforcing the original
 * aspect ratio of the passed in dimension input.
 * You can optionally provide a specific aspect ratio.
 */
export function clampSizeMaintainingRatio({
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  aspectRatio: providedAspectRatio,
}: {
  width: number;
  height: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number;
}) {
  const aspectRatio = providedAspectRatio ?? width / height;
  let w = clamp(width, minWidth, maxWidth);
  let h = clamp(height, minHeight, maxHeight);

  // we need to ensure the aspect ratio of the clamped values
  // is consistent with the original dimensions
  if (width > height) {
    h = clamp(w / aspectRatio, minHeight, maxHeight);
    w = h * aspectRatio;
  } else {
    w = clamp(h * aspectRatio, minWidth, maxWidth);
    h = w / aspectRatio;
  }

  return {
    width: Math.round(w),
    height: Math.round(h),
  };
}
