import shallow from 'zustand/shallow';
import { useRoomStore } from '@roomState/useRoomStore';

export function useRoomSize() {
  return useRoomStore((room) => ({ width: room.state.width, height: room.state.height }), shallow);
}
