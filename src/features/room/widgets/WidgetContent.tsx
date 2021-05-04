import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import { useRoomCanvas } from '../RoomCanvasRenderer';

export interface IWidgetContentProps {
  disablePadding?: boolean;
  className?: string;
  enableTextSelection?: boolean;
}

const useStyles = makeStyles<Theme, IWidgetContentProps>((theme) => ({
  root: (props) => ({
    padding: props.disablePadding ? 0 : theme.spacing(2),
    overflow: 'hidden',
    flex: 1,
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  }),
  enableTextSelection: {
    userSelect: 'text',
  },
}));

export const WidgetContent: React.FC<IWidgetContentProps> = (props) => {
  const classes = useStyles(props);
  // use the drag context to see if we are dragging or resizing a widget -
  // if we are, we want to disable pointer events inside the frame so that
  // iframes and other interactive content don't get triggered as the mouse
  // moves over them
  const { events } = useRoomCanvas();

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // these handlers coordinate disabling pointer events while
    // the user is dragging the canvas or dragging an item
    function disablePointer() {
      if (ref.current) {
        ref.current.style.pointerEvents = 'none';
      }
    }
    function enablePointer() {
      if (ref.current) {
        ref.current.style.pointerEvents = '';
      }
    }

    events.on('panStart', disablePointer);
    events.on('dragStart', disablePointer);
    events.on('panEnd', enablePointer);
    events.on('dragEnd', enablePointer);

    return () => {
      events.off('panStart', disablePointer);
      events.off('dragStart', disablePointer);
      events.off('panEnd', enablePointer);
      events.off('dragEnd', enablePointer);
    };
  }, [events]);

  return (
    <div
      className={clsx(classes.root, props.className, props.enableTextSelection && classes.enableTextSelection)}
      ref={ref}
    >
      {props.children}
    </div>
  );
};
