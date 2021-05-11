import * as React from 'react';
import { Bounds } from '../../types/spatials';
import { ReactEventHandlers } from 'react-use-gesture/dist/types';
import { SpringValue, useSpring, animated } from '@react-spring/web';
import { useGesture } from 'react-use-gesture';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { CanvasObjectContext } from './CanvasObject';
import { useViewport } from '../viewport/useViewport';
import { useCanvas } from './CanvasProvider';

export type ResizeMode = 'free' | 'scale';

export interface IResizeContainerProps {
  /**
   * Controls how the content size changes as the user drags -
   * - free: drag in any direction, no aspect ratio enforcement
   * - scale: enforces the last measured aspect ratio
   */
  mode?: ResizeMode;
  /**
   * Prevent user resizing, even if the handle is present.
   */
  disabled?: boolean;

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

export type ResizeContainerImperativeApi = {
  remeasure(): void;
};

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

      const canvas = useCanvas();
      const viewport = useViewport();
      const { objectId, objectKind } = React.useContext(CanvasObjectContext);

      const resizeInfo = React.useMemo(
        () => ({
          minWidth,
          minHeight,
          maxWidth,
          maxHeight,
          preserveAspect: mode === 'scale',
        }),
        [maxHeight, maxWidth, minHeight, minWidth, mode]
      );

      const initialSize = React.useMemo(() => canvas.getSize(objectId, objectKind), [canvas, objectId, objectKind]);

      // we track the need to remeasure internally, and don't inform external
      // components about a remeasure until the measure has taken place and
      // the new result is passed to onResize - this helps simplify usage
      const [needsRemeasure, setNeedsRemeasure] = React.useState(!initialSize && !disableInitialSizing);
      const requestedSizeRef = React.useRef<Bounds | null>(null);

      // dimensions are initialized to the provided size, or
      // the minimum size, or 0 - if there was no provided size we
      // will be remeasuring immediately, so starting at minimum
      // size reduces the magnitude of the 'pop-in' effect.
      const providedWidth = initialSize?.width || defaultWidth || minWidth || 0;
      const providedHeight = initialSize?.height || defaultHeight || minHeight || 0;

      React.useEffect(() => {
        if (!initialSize && defaultWidth && defaultHeight) {
          canvas.onResizeEnd({ width: defaultWidth, height: defaultHeight }, objectId, objectKind, resizeInfo);
        }
      }, [initialSize, defaultWidth, defaultHeight, canvas, objectId, objectKind, resizeInfo]);

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
            const naturalWidth =
              requestedSizeRef.current?.width ?? contentRef.current?.clientWidth ?? resizeInfo.minWidth ?? 100;
            const naturalHeight =
              requestedSizeRef.current?.height ?? contentRef.current?.clientHeight ?? resizeInfo.minHeight ?? 100;

            canvas.onResizeEnd(
              {
                width: naturalWidth,
                height: naturalHeight,
              },
              objectId,
              objectKind,
              {
                ...resizeInfo,
                // for remeasures, reset the aspect ratio to whatever the content dictates
                preserveAspect: false,
              }
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
      }, [needsRemeasure, canvas, objectId, objectKind, resizeInfo]);

      // this effect updates the spring dimensions when the size changes
      React.useEffect(
        () =>
          canvas.observeSize(objectId, objectKind, (size) => {
            if (!size) return;
            spring.start({
              width: size?.width,
              height: size?.height,
              // update dimensions immediately if the user is actively resizing
              immediate: resizing.goal,
            });
          }),
        [canvas, objectId, objectKind, spring, resizing]
      );

      const bindResizeHandle = useGesture(
        {
          onDrag: (state) => {
            // use case: consider a resizeable container within a draggable container -
            // when the user grabs the resize handle, we want to disable dragging
            state.event?.stopPropagation();

            const deltaX = state.delta[0];
            const deltaY = state.delta[1];

            const newWidth = width.goal + deltaX / viewport.zoom;
            const newHeight = height.goal + deltaY / viewport.zoom;

            canvas.onResize(
              {
                width: newWidth,
                height: newHeight,
              },
              objectId,
              objectKind,
              resizeInfo
            );
          },
          onDragStart: (state) => {
            state.event?.stopPropagation();
            spring.start({ resizing: true, immediate: true });
            canvas.onResizeStart(
              {
                width: width.goal,
                height: height.goal,
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
                width: width.goal,
                height: height.goal,
              },
              objectId,
              objectKind,
              resizeInfo
            );
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
              pointerEvents: resizing.to((v) => (v ? 'none' : '')) as any,
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
