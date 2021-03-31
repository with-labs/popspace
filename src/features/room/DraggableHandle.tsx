import * as React from 'react';
import { DraggableContext } from './Draggable';
import { animated } from '@react-spring/web';

/**
 * This component is *required* for use inside a Draggable. It should wrap the portion of the draggable
 * item which the user can actually click on to drag around. If the whole item is interactive, just
 * wrap it all in DraggableHandle.
 */
export function DraggableHandle({
  children,
  className,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { dragHandleProps, isDraggingAnimatedValue } = React.useContext(DraggableContext);

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
      style={{ cursor: isDraggingAnimatedValue.to((v) => (disabled ? 'inherit' : v ? 'grabbing' : 'grab')) }}
      onClickCapture={onClickCapture}
      className={className}
    >
      {children}
    </animated.div>
  );
}
