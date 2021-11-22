import { makeStyles, Theme } from '@material-ui/core';
import { useCanvas } from '@providers/canvas/CanvasProvider';
import clsx from 'clsx';
import * as React from 'react';

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
  const canvas = useCanvas();

  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // these handlers coordinate disabling pointer events while
    // the user is dragging the canvas or dragging an item
    function disablePointer() {
      // ignore until a certain distance is dragged
      if (canvas.gestureDistance < 10) return;

      if (ref.current) {
        ref.current.style.pointerEvents = 'none';
      }
    }
    function enablePointer() {
      if (ref.current) {
        ref.current.style.pointerEvents = '';
      }
    }

    canvas.on('gestureMove', disablePointer);
    canvas.on('gestureEnd', enablePointer);

    return () => {
      canvas.off('gestureMove', disablePointer);
      canvas.off('gestureEnd', enablePointer);
    };
  }, [canvas]);

  return (
    <div
      className={clsx(classes.root, props.className, props.enableTextSelection && classes.enableTextSelection)}
      ref={ref}
    >
      {props.children}
    </div>
  );
};
