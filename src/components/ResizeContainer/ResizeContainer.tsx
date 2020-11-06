import * as React from 'react';
import { Bounds } from '../../types/spatials';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';
import { SpringValue, useSpring, animated } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { clamp } from '../../utils/math';
import { useRoomViewport } from '../../features/room/RoomViewport';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

export type ResizeMode = 'free' | 'scale';

export interface IResizeContainerProps {
  /**
   * Controls how the content size changes as the user drags -
   * - free: drag in any direction, no aspect ratio enforcement
   * - scale: enforces the last measured aspect ratio
   */
  mode?: ResizeMode;
  /**
   * An advanced feature - scale the change in size by a multiplier.
   * This is useful when you change the scale origin of the content itself,
   * for example content with a center origin and a handle in the
   * corner  should scale resize changes by 2 to account for the fact that the
   * content will resize both toward the handle and away from it at the same rate.
   */
  resizeScaleFactor?: number;
  /**
   * Prevent user resizing, even if the handle is present.
   */
  disabled?: boolean;
  /**
   * ResizeContainer acts as a 'controlled' component - you must track
   * the actual size in state yourself and pass it here. If you pass `null`,
   * the container will automatically remeasure itself and report the result
   * to `onResize` - you should store that value and pass it to `size` to
   * stabilize the sizing.
   */
  size: Bounds | null;
  /**
   * When the content is resized or remeasured, the new size will be reported
   * to this callback. Store this size in state somewhere and pass it back to
   * the `size` prop.
   */
  onResize: (newSize: Bounds) => void;

  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;

  children: React.ReactNode;
}

export const ResizeContainerContext = React.createContext<{
  handleProps: ReactEventHandlers;
  isResizingSpringValue: SpringValue<boolean>;
  disableResize: boolean;
  /**
   * Forces the container to remeasure the native size of its content. Invoke this
   * when content changes to reset the container to the size of the content.
   */
  remeasure: () => void;
} | null>(null);

export function useResizeContext() {
  const ctx = React.useContext(ResizeContainerContext);
  if (!ctx) {
    throw new Error('You can only use useResizeContext inside a ResizeContainer');
  }
  return ctx;
}

const useStyles = makeStyles({
  root: {
    position: 'relative',
    willChange: 'width, height',
  },
  unmeasuredContentSizer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  contentSizer: {
    width: '100%',
    height: '100%',
  },
});

function clampAndEnforceMode({
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  mode,
  originalAspectRatio,
}: {
  width: number;
  height: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  mode: ResizeMode;
  originalAspectRatio: number;
}) {
  let w = clamp(width, minWidth, maxWidth);
  let h = clamp(height, minHeight, maxHeight);

  if (mode === 'scale') {
    // for 'scale' mode, we need to ensure the aspect ratio of the clamped values
    // is consistent with the original dimensions
    if (width > height) {
      h = w / originalAspectRatio;
    } else {
      w = h * originalAspectRatio;
    }
  }

  return {
    width: Math.round(w),
    height: Math.round(h),
  };
}

/**
 * A content container which allows the user to resize it using a
 * resize handle, which you can render as you like anywhere within the
 * container.
 *
 * For best results, you should pass a single element child with 100% width, 100% height,
 * and overflow: hidden.
 *
 * The container also allows selecting a resize mode - see
 * `mode` prop for details.
 */
export const ResizeContainer = React.memo<IResizeContainerProps>(
  ({
    mode = 'free',
    disabled,
    size,
    resizeScaleFactor = 1,
    onResize,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    children,
  }) => {
    const classes = useStyles();

    const viewport = useRoomViewport();

    // we track the need to remeasure internally, and don't inform external
    // components about a remeasure until the measure has taken place and
    // the new result is passed to onResize - this helps simplify usage
    const [needsRemeasure, setNeedsRemeasure] = React.useState(!size);
    const [originalAspectRatio, setOriginalAspectRatio] = React.useState(1);

    // dimensions are initialized to the provided size, or
    // the minimum size, or 0 - if there was no provided size we
    // will be remeasuring immediately, so starting at minimum
    // size reduces the magnitude of the 'pop-in' effect.
    const providedWidth = size?.width || minWidth || 0;
    const providedHeight = size?.height || minHeight || 0;

    const [{ width, height, resizing }, set] = useSpring(() => ({
      width: providedWidth,
      height: providedHeight,
      resizing: false,
    }));

    const contentRef = React.useRef<HTMLDivElement>(null);

    // this effect handles remeasuring the content when needed
    React.useEffect(() => {
      if (!contentRef.current || !needsRemeasure) return;

      const naturalWidth = contentRef.current.clientWidth;
      // FIXME: figure out why this height is measured slightly wrong -
      // has to do with whatever is causing all heights in absolute positioned
      // containers to be off
      const naturalHeight = contentRef.current.clientHeight - 4;

      const aspect = naturalWidth / naturalHeight;
      setOriginalAspectRatio(aspect);

      onResize(
        clampAndEnforceMode({
          width: naturalWidth,
          height: naturalHeight,
          minHeight,
          minWidth,
          maxHeight,
          maxWidth,
          mode,
          originalAspectRatio: aspect,
        })
      );
      setNeedsRemeasure(false);
    }, [needsRemeasure, onResize, minHeight, minWidth, maxHeight, maxWidth, mode]);

    // this effect updates the spring dimensions when the `size` prop changes
    React.useEffect(() => {
      set({
        width: providedWidth,
        height: providedHeight,
      });
    }, [providedWidth, providedHeight, set]);

    const bindResizeHandle = useGesture(
      {
        onDrag: (state) => {
          state.event?.stopPropagation();

          let initialPosition;
          if (state.first) {
            initialPosition = state.xy;
          } else {
            initialPosition = state.memo;
          }

          const deltaX = state.xy[0] - initialPosition[0];
          const deltaY = state.xy[1] - initialPosition[1];

          const newWidth = providedWidth + deltaX * resizeScaleFactor;
          const newHeight = providedHeight + deltaY * resizeScaleFactor;

          set(
            clampAndEnforceMode({
              width: newWidth,
              height: newHeight,
              minHeight,
              minWidth,
              maxHeight,
              maxWidth,
              originalAspectRatio,
              mode,
            })
          );

          // memoize initialPosition for future events to reference
          return initialPosition;
        },
        onDragStart: (state) => {
          state.event?.stopPropagation();
          viewport.onObjectDragStart();
          set({ resizing: true });
        },
        onDragEnd: (state) => {
          state.event?.stopPropagation();
          viewport.onObjectDragEnd();
          set({ resizing: false });
          // report change to parent
          onResize({
            width: width.goal,
            height: height.goal,
          });
        },
      },
      {
        eventOptions: { capture: true },
      }
    );

    const forceRemeasure = React.useCallback(() => {
      setNeedsRemeasure(true);
    }, []);

    const contextValue = {
      handleProps: bindResizeHandle(),
      isResizingSpringValue: resizing,
      disableResize: !!disabled,
      remeasure: forceRemeasure,
    };

    return (
      <ResizeContainerContext.Provider value={contextValue}>
        <animated.div
          className={classes.root}
          data-resizable-container
          style={{
            width,
            height,
            pointerEvents: resizing.to((v) => (v ? 'none' : undefined)) as any,
          }}
        >
          <div
            // Until the content has been measured (or re-measured), we render it in an absolute
            // positioned overflowing frame to try to estimate its innate size, which we will
            // use as the new explicit size of the draggable once measuring is complete
            className={clsx({
              [classes.contentSizer]: !needsRemeasure,
              [classes.unmeasuredContentSizer]: needsRemeasure,
            })}
            // while we are measuring, because of word-wrapping and other css overflow rules,
            // we want to enforce at least the minimum sizes - otherwise text wraps and creates
            // a taller measurement than we would want
            style={{ minWidth, minHeight, maxWidth, maxHeight }}
            ref={contentRef}
            data-content-sizer
          >
            {children}
          </div>
        </animated.div>
      </ResizeContainerContext.Provider>
    );
  }
);
