import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { animated, to } from '@react-spring/web';
import clsx from 'clsx';
import { DraggableContext } from '../Draggable';

export interface IWidgetContentProps {
  disablePadding?: boolean;
  className?: string;
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
}));

export const WidgetContent: React.FC<IWidgetContentProps> = (props) => {
  const classes = useStyles(props);
  // use the drag context to see if we are dragging or resizing this widget -
  // if we are, we want to disable pointer events inside the frame so that
  // iframes and other interactive content don't get triggered as the mouse
  // moves over them
  const { isDraggingAnimatedValue } = React.useContext(DraggableContext);

  return (
    <animated.div
      className={clsx(classes.root, props.className)}
      style={{
        pointerEvents: to([isDraggingAnimatedValue], (dr) => (dr ? 'none' : undefined)) as any,
      }}
    >
      {props.children}
    </animated.div>
  );
};
