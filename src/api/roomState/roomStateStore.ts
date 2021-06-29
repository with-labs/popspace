import create from 'zustand/vanilla';
import { Vector2 } from '@src/types/spatials';
import { combineAndImmer } from './combineAndImmer';
import { wallPaperOptions } from '@features/roomControls/roomSettings/WallpaperOptions';
import { WidgetShape } from './types/widgets';
import { ActorShape, ParticipantState } from './types/participants';
import { RoomDetailsStateShape, RoomPositionState } from './types/common';
import { RoomStateCacheApi } from './RoomStateCacheApi';

const defaultWallpaperCategory = 'todoBoards';
const defaultWallpaper = 0;

/**
 * Our client room state stores user information slightly differently than
 * how the server transmits it. The User is the top-level abstraction and
 * it contains references to sessions by ID for bookkeeping purposes. The
 * latest data about the user is consolidated into this shape, regardless
 * of which session it originated from.
 */
export type RoomUserStateShape = {
  id: string;
  participantState: ParticipantState;
  sessionIds: Set<string>;
  actor: ActorShape;
};

export type RoomCursorStateShape = {
  position: Vector2;
  active: boolean;
};

export type RoomStateShape = {
  id: string | null;
  widgets: Record<string, WidgetShape>;
  users: Record<string, RoomUserStateShape>;
  /** Allows finding users based on session IDs */
  sessionLookup: Record<string, string>;
  state: RoomDetailsStateShape;
  widgetPositions: Record<string, RoomPositionState>;
  userPositions: Record<string, RoomPositionState>;
  sessionId: string | null;
  cursors: Record<string, RoomCursorStateShape>;
  displayName: string;
};

export const emptyState: RoomStateShape = {
  id: null,
  widgets: {},
  users: {},
  sessionLookup: {},
  displayName: '',
  state: {
    wallpaperUrl: wallPaperOptions[defaultWallpaperCategory][defaultWallpaper].url,
    isCustomWallpaper: false,
    zOrder: [],
    wallpaperRepeats: false,
    backgroundColor: '#ffffff',
  },
  widgetPositions: {},
  userPositions: {},
  sessionId: null,
  cursors: {},
};

/**
 * The cache of the room state for the current joined meeting. This is purely
 * a state cache; the synchronization happens at the API client layer.
 */
export const roomStateStore = create(
  combineAndImmer(emptyState, (set, get) => ({
    cacheApi: new RoomStateCacheApi(set, get, emptyState),
  }))
);

// convenience named types
export type RoomStateStore = typeof roomStateStore;
