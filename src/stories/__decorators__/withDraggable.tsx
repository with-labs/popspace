import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { DraggableContext } from '../../features/room/Draggable';
import { useSpring } from '@react-spring/web';

export function withDraggable(S: Story) {
  return (
    <WithDraggableWrapper>
      <S />
    </WithDraggableWrapper>
  );
}

function WithDraggableWrapper({ children }: { children: any }) {
  const { isDragging } = useSpring({ isDragging: false });

  return (
    <DraggableContext.Provider value={{ isDraggingAnimatedValue: isDragging, dragHandleProps: {} as any }}>
      {children}
    </DraggableContext.Provider>
  );
}
