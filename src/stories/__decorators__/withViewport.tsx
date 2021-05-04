import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { RoomCanvasRendererContext, RoomCanvasEvents } from '../../features/room/RoomCanvasRenderer';
import { Viewport } from '../../providers/viewport/Viewport';

const value = {
  onObjectDragStart: () => {},
  onObjectDragEnd: () => {},
  width: 1000,
  height: 1000,
  events: new RoomCanvasEvents(),
  viewport: new Viewport({}),
};

export function withViewport(S: Story) {
  return (
    <RoomCanvasRendererContext.Provider value={value}>
      <S />
    </RoomCanvasRendererContext.Provider>
  );
}
