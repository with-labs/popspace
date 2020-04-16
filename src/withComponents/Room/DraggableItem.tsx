import React from 'react';
import { useDrag } from 'react-dnd';

const style: React.CSSProperties = {
  position: 'absolute',
  padding: '0.5rem 1rem',
  cursor: 'move',
  transition: 'top 1s, left 1s',
};

export interface IDraggableItemProps {
  id: any;
  left: number;
  top: number;
  isDraggable?: boolean;
}

export const DraggableItem: React.FC<IDraggableItemProps> = ({ id, left, top, children, isDraggable = false }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { id, left, top, type: 'BUBBLE' },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: monitor => !!isDraggable,
  });

  if (isDragging) {
    return <div ref={drag} />;
  }
  return (
    <div ref={drag} style={{ ...style, left, top }}>
      {children}
    </div>
  );
};
