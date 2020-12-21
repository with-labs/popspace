import * as React from 'react';
import { useWheel } from 'react-use-gesture';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

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
export const WidgetScrollPane: React.FC<IWidgetScrollPaneProps> = (props) => {
  const classes = useStyles();

  // we need to use a ref to bind the scroll element to enable active event interception
  const ref = React.useRef<HTMLDivElement>(null);

  useWheel(
    (state) => {
      const yScroll = state.delta[1];
      // ignore zoom events or horizontal scrolling
      if (state.event?.metaKey || state.event?.ctrlKey || yScroll === 0) {
        return;
      }

      // omit 'last' event in a gesture as it doesn't have an active DOM event anymore
      // (react-use-gesture quirk)
      if (!state.last && state.event && state.event.currentTarget) {
        const el = state.event.currentTarget as HTMLDivElement;
        const hasScrollSpace = el.clientHeight !== el.scrollHeight;
        const isAtBottom = el.scrollTop + el.clientHeight === el.scrollHeight;
        const isAtTop = el.scrollTop === 0;

        // only filter events when the scrollable view can actually scroll. that includes
        // ignoring upward scroll at the top and downward scroll at the bottom
        if (hasScrollSpace && !(isAtBottom && yScroll > 0) && !(isAtTop && yScroll < 0)) {
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
};
