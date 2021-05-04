import * as React from 'react';
import { Bounds } from '../../types/spatials';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';
import { SpringValue, useSpring, animated } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { clamp } from '../../utils/math';
import { useRoomCanvas } from '../../features/room/RoomCanvasRenderer';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { clampSizeMaintainingRatio } from '../../utils/clampSizeMaintainingRatio';

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
  getResizeScaleFactor?: () => number;
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
  /**
   * If no size is provided and disableInitialSizing = false,
   * this will automatically set the initial width
   */
  defaultWidth?: number;
  /**
   * If no size is provided and disableInitialSizing = false,
   * this will automatically set the initial height
   */
  defaultHeight?: number;

  children: React.ReactNode;

  /**
   * Disables the initial size measure on mount
   */
  disableInitialSizing?: boolean;
}

export const ResizeContainerContext = React.createContext<{
  handleProps: ReactEventHandlers;
  isResizingSpringValue: SpringValue<boolean>;
  disableResize: boolean;
  /**
   * Forces the container to remeasure the native size of its content. Invoke this
   * when content changes to reset the container to the size of the content.
   */
  remeasure: (requestedSize?: Bounds) => void;
  size: Bounds | null;
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
  if (mode === 'scale') {
    return clampSizeMaintainingRatio({
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      aspectRatio: originalAspectRatio,
    });
  } else {
    return {
      width: Math.round(clamp(width, minWidth, maxWidth)),
      height: Math.round(clamp(height, minHeight, maxHeight)),
    };
  }
}

export type ResizeContainerImperativeApi = {
  remeasure(): void;
};

// static reference to maintain referential equality and avoid
// unnecessary rerenders.
// don't you love programming?
const return1 = () => 1;

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
export const ResizeContainer = React.memo(
  React.forwardRef<ResizeContainerImperativeApi, IResizeContainerProps>(
    (
      {
        mode = 'free',
        disabled,
        size,
        getResizeScaleFactor = return1,
        onResize,
        maxWidth,
        maxHeight,
        minWidth,
        minHeight,
        children,
        disableInitialSizing,
        defaultHeight,
        defaultWidth,
      },
      ref
    ) => {
      const classes = useStyles();

      const viewport = useRoomCanvas();

      // we track the need to remeasure internally, and don't inform external
      // components about a remeasure until the measure has taken place and
      // the new result is passed to onResize - this helps simplify usage
      const [needsRemeasure, setNeedsRemeasure] = React.useState(!size && !disableInitialSizing);
      const requestedSizeRef = React.useRef<Bounds | null>(null);
      const [originalAspectRatio, setOriginalAspectRatio] = React.useState(() => {
        if (size) {
          return size.width / (size.height || 1);
        } else if (defaultWidth && defaultHeight) {
          return defaultWidth / defaultHeight;
        }
        return 1;
      });

      // dimensions are initialized to the provided size, or
      // the minimum size, or 0 - if there was no provided size we
      // will be remeasuring immediately, so starting at minimum
      // size reduces the magnitude of the 'pop-in' effect.
      const providedWidth = size?.width || defaultWidth || minWidth || 0;
      const providedHeight = size?.height || defaultHeight || minHeight || 0;

      React.useEffect(() => {
        if (!size && defaultWidth && defaultHeight) {
          onResize({ width: defaultWidth, height: defaultHeight });
        }
      }, [size, defaultWidth, defaultHeight, onResize]);

      const [{ width, height, resizing }, spring] = useSpring(() => ({
        width: providedWidth,
        height: providedHeight,
        resizing: false,
      }));

      const contentRef = React.useRef<HTMLDivElement>(null);

      // this effect handles remeasuring the content when needed
      React.useEffect(() => {
        if (!needsRemeasure) return;

        const remeasure = () =>
          requestAnimationFrame(async () => {
            if (!contentRef.current && !requestedSizeRef.current) return;

            // give preference to a requested size if the user provided one in their remeasure call,
            // then try element size, fall back to min size, and finally a simple 100x100
            const naturalWidth = requestedSizeRef.current?.width ?? contentRef.current?.clientWidth ?? minWidth ?? 100;
            const naturalHeight =
              requestedSizeRef.current?.height ?? contentRef.current?.clientHeight ?? minHeight ?? 100;

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
          });

        // wait for fonts to load before resizing
        if (document.fonts.ready) {
          // race the promise load with a 3 second timer (i.e. timeout if wait is too long)
          Promise.race([document.fonts.ready, new Promise((res) => setTimeout(res, 3000))]).then(remeasure);
        } else {
          remeasure();
        }
      }, [needsRemeasure, onResize, minHeight, minWidth, maxHeight, maxWidth, mode]);

      // this effect updates the spring dimensions when the size changes
      React.useEffect(() => {
        spring.start({
          width: providedWidth,
          height: providedHeight,
        });
      }, [providedWidth, providedHeight, spring]);

      const bindResizeHandle = useGesture(
        {
          onDrag: (state) => {
            // use case: consider a resizeable container within a draggable container -
            // when the user grabs the resize handle, we want to disable dragging
            state.event?.stopPropagation();

            let initialPosition;
            if (state.first) {
              initialPosition = state.xy;
            } else {
              initialPosition = state.memo;
            }

            const deltaX = state.xy[0] - initialPosition[0];
            const deltaY = state.xy[1] - initialPosition[1];

            const newWidth = providedWidth + deltaX * getResizeScaleFactor();
            const newHeight = providedHeight + deltaY * getResizeScaleFactor();

            spring.set(
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
            spring.start({ resizing: true });
          },
          onDragEnd: (state) => {
            state.event?.stopPropagation();
            viewport.onObjectDragEnd();
            spring.start({ resizing: false });
            // report change to parent
            onResize({
              width: width.goal,
              height: height.goal,
            });
          },
        },
        {
          eventOptions: { capture: false },
        }
      );

      const forceRemeasure = React.useCallback((requestedSize?: Bounds) => {
        setNeedsRemeasure(true);
        requestedSizeRef.current = requestedSize || null;
      }, []);

      const contextValue = {
        handleProps: bindResizeHandle(),
        isResizingSpringValue: resizing,
        disableResize: !!disabled,
        remeasure: forceRemeasure,
        size,
      };

      React.useImperativeHandle(ref, () => ({
        remeasure: forceRemeasure,
      }));

      return (
        <ResizeContainerContext.Provider value={contextValue}>
          <animated.div
            className={classes.root}
            data-resizable-container
            style={{
              width,
              height,
              pointerEvents: resizing.to((v) => (v ? 'none' : 'initial')) as any,
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
              // we want to enforce at least the width bounds - otherwise text wraps and creates
              // a taller measurement than we would want. But we don't want to specify on
              // both axes - if we did, we would be enforcing a specific incorrect aspect ratio
              // for content that was smaller or larger than the bounds. One axis must be free to
              // resize so that the correct aspect ratio can be measured, then the whole content
              // will be scaled according to the bounds of both axes in the logic above.
              style={{ minWidth, maxWidth }}
              ref={contentRef}
              data-content-sizer
            >
              {children}
            </div>
          </animated.div>
        </ResizeContainerContext.Provider>
      );
    }
  )
);
