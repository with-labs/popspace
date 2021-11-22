import { Vector2 } from '@src/types/spatials';
import create from 'zustand/vanilla';

import { combineAndImmer } from './combineAndImmer';
import { RoomStateCacheApi } from './RoomStateCacheApi';
import { RoomDetailsStateShape, RoomPositionState, RoomWallpaper } from './types/common';
import { ActorShape, ParticipantState } from './types/participants';
import { WidgetShape } from './types/widgets';

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
  isObserver: boolean;
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
  wallpaper: RoomWallpaper | null;
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
  wallpaper: null,
  state: {
    wallpaperUrl: null,
    zOrder: [],
    wallpaperRepeats: false,
    backgroundColor: '#ffffff',
    // defaults to global audio, users can enable spatial
    isAudioGlobal: true,
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
