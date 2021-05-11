import * as React from 'react';
import { CanvasObjectContext } from './CanvasObject';
import { animated } from '@react-spring/web';

export interface ICanvasObjectDragHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

/**
 * This component is *required* for use inside a CanvasObject if you want to move it.
 * It should wrap the portion of the draggable item which the user can actually click on to drag around.
 * If the whole item is interactive, just wrap it all in CanvasObjectDragHandle.
 */
export const CanvasObjectDragHandle: React.FC<ICanvasObjectDragHandleProps> = ({
  children,
  className,
  disabled,
  style,
  ...rest
}) => {
  const { dragHandleProps, isDraggingAnimatedValue } = React.useContext(CanvasObjectContext);

  /**
   * This handler prevents click events from firing within the draggable handle
   * if the user was dragging during the gesture - for example we don't want to
   * click a Link widget if the user is dragging it when they release the mouse.
   */
  const onClickCapture = React.useCallback(
    (ev: React.MouseEvent) => {
      if (isDraggingAnimatedValue.goal) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    },
    [isDraggingAnimatedValue]
  );

  return (
    <animated.div
      {...(disabled ? {} : dragHandleProps)}
      style={{ ...style, cursor: isDraggingAnimatedValue.to((v) => (disabled ? 'inherit' : v ? 'grabbing' : 'grab')) }}
      onClickCapture={onClickCapture}
      className={className}
      {...rest}
    >
      {children}
    </animated.div>
  );
};
