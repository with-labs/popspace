import { Vector2 } from '@src/types/spatials';

export interface CursorUpdatePassthroughPayload {
  kind: 'cursorUpdate';
  userId: string;
  cursorState: {
    position: Vector2;
    active: boolean;
  };
}

// add new types in a union as they are defined
export type PassthroughPayload = CursorUpdatePassthroughPayload;
