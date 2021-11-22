import * as React from 'react';
import { useWheel } from 'react-use-gesture';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { useViewportGestureState } from '@providers/viewport/useViewportGestureState';

export interface IWidgetScrollPaneProps extends React.HTMLAttributes<HTMLDivElement> {}

const useStyles = makeStyles(() => ({
  root: {
    overflowY: 'auto',
  },
}));

/**
 * Renders a vertically scrollable div which intercepts wheel events and
 * prevents them from reaching the viewport for a more native experience.
 */
export const WidgetScrollPane = React.forwardRef<HTMLDivElement, IWidgetScrollPaneProps>((props, forwardedRef) => {
  const classes = useStyles();

  // we need to use a ref to bind the scroll element to enable active event interception
  const ref = React.useRef<any>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current);

  const isViewportGestureActive = useViewportGestureState((s) => s.isGesturing);

  useWheel(
    (state) => {
      // don't scroll while viewport gesture is active
      if (isViewportGestureActive) return;

      // ignore zoom events or horizontal scrolling
      if (state.event?.metaKey || state.event?.ctrlKey) {
        return;
      }

      // omit 'last' event in a gesture as it doesn't have an active DOM event anymore
      // (react-use-gesture quirk)
      if (!state.last && state.event && state.event.currentTarget) {
        const el = state.event.currentTarget as HTMLDivElement;
        const hasScrollSpace = el.clientHeight !== el.scrollHeight;

        // only filter events when the scrollable view can actually scroll.
        if (hasScrollSpace) {
          state.event.stopPropagation();
        }
      }
    },
    {
      domTarget: ref,
      eventOptions: {
        // must be active events to supersede viewport events
        passive: false,
      },
    }
  );

  return <div ref={ref} {...props} className={clsx(classes.root, props.className)} />;
});
