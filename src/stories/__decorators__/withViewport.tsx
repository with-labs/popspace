import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { RoomViewportContext } from '../../features/room/RoomViewport';

const value = {
  toWorldCoordinate: () => ({ x: 0, y: 0 }),
  getZoom: () => 1,
  onObjectDragStart: () => {},
  onObjectDragEnd: () => {},
};

export function withViewport(S: Story) {
  return (
    <RoomViewportContext.Provider value={value}>
      <S />
    </RoomViewportContext.Provider>
  );
}
