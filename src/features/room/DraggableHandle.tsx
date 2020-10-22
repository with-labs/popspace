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

  return (
    <animated.div
      {...(disabled ? {} : dragHandleProps)}
      style={{ cursor: isDraggingAnimatedValue.to((v) => (disabled ? 'inherit' : v ? 'grabbing' : 'grab')) }}
      className={className}
    >
      {children}
    </animated.div>
  );
}
