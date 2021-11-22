import create from 'zustand';
import client from './client';

// binds the roomStateStore vanilla Zustand store as a React hook
export const useRoomStore = create(client.roomStateStore);

// re-exporting as it's convenient to use these together
export type { RoomStateShape } from './roomState/roomStateStore';
