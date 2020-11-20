import { createSlice, nanoid, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { EmojiData } from 'emoji-mart';
import { Bounds, Vector2 } from '../../types/spatials';
import { RootState } from '../../state/store';
import { clamp } from '../../utils/math';
import { WidgetState, PersonState, WidgetType, WidgetData } from '../../types/room';
import { MIN_WIDGET_HEIGHT, MIN_WIDGET_WIDTH } from '../../constants/room';
import { wallPaperOptions } from '../roomControls/roomSettings/WallpaperOptions';

const WARNING_STICKY_ID = 'warningSticky';
const WARNING_STICKY_TEXT = `WARNING!

With doesn't save your room contents after everyone leaves yet. We're working on it right now!

Thanks for being an early user!
`;

/**
 * Positioning data for an object in a room,
 * along with a reference to the object itself.
 */
export type ObjectPositionData = {
  /**
   * RoomObject positions are in "world space" pixel values - i.e. pixel
   * position based on 100% zoom.
   */
  position: Vector2;
  /**
   * User-resizable objects will need to set their size in state so it can
   * be synchronized with others. Non-user-resizable objects will not define
   * a size, and allow their contents to size themselves.
   */
  size?: Bounds;
};

/**
 * The main state slice for a Room, containing all data important to rendering
 * a Room
 */
interface RoomState {
  widgets: Record<string, WidgetState>;
  people: Record<string, PersonState>;
  /** Position data is keyed on the id of the widget or participant */
  positions: Record<string, ObjectPositionData>;
  zOrder: string[];
  bounds: Bounds;
  wallpaperUrl: string;
  useSpatialAudio: boolean;
  syncedFromPeer: boolean;
}

/** Use for testing only, please. */
export const initialState: RoomState = {
  positions: {
    [WARNING_STICKY_ID]: {
      position: { x: 0, y: 0 },
    },
  },
  zOrder: [],
  widgets: {
    [WARNING_STICKY_ID]: {
      id: WARNING_STICKY_ID,
      participantSid: 'withteam',
      isDraft: false,
      kind: 'widget',
      type: WidgetType.StickyNote,
      data: {
        text: WARNING_STICKY_TEXT,
        author: 'The With Team',
      },
    },
  },
  people: {},
  // TODO: make this changeable
  bounds: {
    width: 2400,
    height: 2400,
  },
  wallpaperUrl: wallPaperOptions[0].url,
  useSpatialAudio: true,
  syncedFromPeer: false,
};

/**
 * Here's how it works - this entire slice of state is synced between all participants via WebRTC data channels.
 * To enable synchronization we mark actions as "sync: true" in their payloads. This indicates to our dispatch
 * wrapper that they should be sent over the network to peers.
 *
 * In order to add this field to each action, we have a simple reusable 'prepare' function which is applied to each
 * key-reducer in the slice below. Read more about action prepare steps:
 * https://redux-toolkit.js.org/api/createSlice#customizing-generated-action-creators
 */

const prepareSyncAction = <T>(initialPayload: T) => ({
  payload: {
    ...initialPayload,
    sync: true,
  },
});

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    /** adds a widget at the specified position */
    addWidget: {
      // the user is not required to provide an id for a new widget;
      // it will be generated for them in the action preparation step.
      prepare(input: { position: Vector2; size?: Bounds; widget: Omit<WidgetState, 'id'> }) {
        return {
          payload: {
            ...input,
            widget: {
              id: nanoid(),
              ...input.widget,
            } as WidgetState,
            sync: true,
          },
        };
      },
      reducer(
        state,
        {
          payload,
        }: PayloadAction<{
          position: Vector2;
          size?: Bounds;
          widget: WidgetState;
        }>
      ) {
        state.positions[payload.widget.id] = {
          position: payload.position,
          size: payload.size,
        };
        state.zOrder = state.zOrder || [];
        state.zOrder.push(payload.widget.id);
        state.widgets[payload.widget.id] = payload.widget;
      },
    },
    /** adds a person at the specified position */
    addPerson: {
      prepare: (a) =>
        prepareSyncAction<{
          position: Vector2;
          person: { id: string; avatar: string; emoji?: EmojiData | string; status?: string };
        }>(a),
      reducer(
        state,
        {
          payload,
        }: PayloadAction<{
          position: Vector2;
          person: {
            id: string;
            avatar: string;
            emoji?: EmojiData | string;
            status?: string;
          };
        }>
      ) {
        state.positions[payload.person.id] = {
          position: payload.position,
        };

        state.people[payload.person.id] = {
          kind: 'person',
          isSpeaking: false,
          status: null,
          emoji: null,
          ...payload.person,
        };
      },
    },
    removeWidget: {
      prepare: (a) => prepareSyncAction<{ id: string }>(a),
      reducer(state, { payload }: PayloadAction<{ id: string }>) {
        delete state.widgets[payload.id];
        delete state.positions[payload.id];
        state.zOrder = (state.zOrder || []).filter((id) => id !== payload.id);
      },
    },
    removePerson: {
      prepare: (a) => prepareSyncAction<{ id: string }>(a),
      reducer(state, { payload }: PayloadAction<{ id: string }>) {
        delete state.people[payload.id];
        delete state.positions[payload.id];
      },
    },
    /** Updates the position of any object in the room by ID */
    moveObject: {
      prepare: (a) => prepareSyncAction<{ id: string; position: Vector2 }>(a),
      reducer(state, { payload }: PayloadAction<{ id: string; position: Vector2 }>) {
        if (!state.positions[payload.id]) return;
        // restrict the position to the bounds of the room
        const clamped = {
          x: clamp(payload.position.x, -state.bounds.width / 2, state.bounds.width / 2),
          y: clamp(payload.position.y, -state.bounds.height / 2, state.bounds.height / 2),
        };
        state.positions[payload.id].position = clamped;
      },
    },
    resizeObject: {
      prepare: (a) => prepareSyncAction<{ id: string; size?: Bounds | null }>(a),
      reducer(state, { payload }: PayloadAction<{ id: string; size?: Bounds | null }>) {
        if (!state.positions[payload.id]) return;
        if (payload.size) {
          const clamped = {
            width: clamp(payload.size.width, MIN_WIDGET_WIDTH, Infinity),
            height: clamp(payload.size.height, MIN_WIDGET_HEIGHT, Infinity),
          };
          state.positions[payload.id].size = clamped;
        } else {
          state.positions[payload.id].size = undefined;
        }
      },
    },
    bringToFront: {
      prepare: (a) => prepareSyncAction<{ id: string }>(a),
      reducer(state, { payload }: PayloadAction<{ id: string }>) {
        const index = state.zOrder ? state.zOrder.indexOf(payload.id) : -1;
        if (index === -1) return;

        state.zOrder.splice(index, 1);
        state.zOrder.push(payload.id);
      },
    },
    /** Updates the data associated with a widget */
    updateWidgetData: {
      prepare: (a) => prepareSyncAction<{ id: string; data: Partial<WidgetData>; publish?: boolean }>(a),
      reducer(state, { payload }: PayloadAction<{ id: string; data: Partial<WidgetData>; publish?: boolean }>) {
        if (!state.widgets[payload.id]) return;
        state.widgets[payload.id].data = {
          ...state.widgets[payload.id].data,
          ...payload.data,
        };
        // if publish is true and we're already a draft,
        // publish it!
        if (payload.publish && state.widgets[payload.id].isDraft) {
          state.widgets[payload.id].isDraft = false;
        }
      },
    },
    /** Changes the emoji displayed for a participant */
    updatePersonStatus: {
      prepare: (a) => prepareSyncAction<{ id: string; emoji?: EmojiData | string | null; status?: string | null }>(a),
      reducer(
        state,
        { payload }: PayloadAction<{ id: string; emoji?: EmojiData | string | null; status?: string | null }>
      ) {
        if (!state.people[payload.id]) return;
        if (payload.emoji !== undefined) {
          state.people[payload.id].emoji = payload.emoji;
        }
        if (payload.status !== undefined) {
          state.people[payload.id].status = payload.status;
        }
      },
    },
    /** Changes the avatar displayed for a participant */
    updatePersonAvatar: {
      prepare: (a) => prepareSyncAction<{ id: string; avatar: string }>(a),
      reducer(state, { payload }: PayloadAction<{ id: string; avatar: string }>) {
        if (!state.people[payload.id]) return;
        state.people[payload.id].avatar = payload.avatar;
      },
    },
    updateRoomWallpaper: {
      prepare: (a) => prepareSyncAction<{ wallpaperUrl: string }>(a),
      reducer(state, { payload }: PayloadAction<{ wallpaperUrl: string }>) {
        state.wallpaperUrl = payload.wallpaperUrl;
      },
    },
    updatePersonIsSpeaking: {
      prepare: (a) => prepareSyncAction<{ id: string; isSpeaking: boolean }>(a),
      reducer(state, { payload }: PayloadAction<{ id: string; isSpeaking: boolean }>) {
        if (!state.people[payload.id]) return;

        state.people[payload.id].isSpeaking = payload.isSpeaking;
      },
    },
    /**
     * Import room data, including widgets and their positions, wallpaper, and other
     * settings - and overwrite existing stuff. People and their positions remain
     * intact.
     */
    importRoom: {
      prepare: (a) => prepareSyncAction<Omit<RoomState, 'people'>>(a),
      reducer(state, { payload }: PayloadAction<Omit<RoomState, 'people'> & { sync: boolean }>) {
        // cache people and their associated position data, as well as draft widgets -
        // we don't want the action of importing to close a draft someone was working on.
        const { people, positions, widgets } = state;
        const draftWidgets = Object.entries(widgets).reduce((acc, [id, s]) => {
          if (!s.isDraft) return acc;
          acc[id] = s;
          return acc;
        }, {} as Record<string, WidgetState>);
        const persistedIds = [...Object.keys(draftWidgets), ...Object.keys(people)];
        const preservedPositions = persistedIds.reduce((acc, personId) => {
          acc[personId] = positions[personId];
          return acc;
        }, {} as Record<string, ObjectPositionData>);
        // merge with the rest of the incoming state - except the 'sync' prop
        const { sync, ...incomingState } = payload;
        return {
          ...incomingState,
          widgets: {
            ...incomingState.widgets,
            ...draftWidgets,
          },
          positions: {
            ...payload.positions,
            ...preservedPositions,
          },
          people,
        };
      },
    },
    /**
     * This action is special - it clears the local room state slice. It won't be broadcast
     * to other peers - this is just a reset for when you leave the room.
     */
    leave() {
      return initialState;
    },
    syncFromPeer(lastState, action: PayloadAction<{ state: RoomState; recipient: string }>) {
      if (lastState.syncedFromPeer) return lastState;
      return {
        ...action.payload.state,
        syncedFromPeer: true,
      };
    },
  },
});

export const { actions, reducer } = roomSlice;

const selectWidgets = (state: RootState) => state.room.widgets;
const selectPeople = (state: RootState) => state.room.people;

export const selectors = {
  createPositionSelector: (objectId: string) => (state: RootState) => state.room.positions[objectId]?.position || null,
  // memoized so that an identical widgets map doesn't produce different arrays from Object.keys
  selectWidgetIds: createSelector(selectWidgets, (widgets) => Object.keys(widgets)),
  createWidgetSelector: (widgetId: string) => (state: RootState) => state.room.widgets[widgetId] || null,
  // memoized so that an identical people map doesn't produce different arrays from Object.keys
  selectPeopleIds: createSelector(selectPeople, (people) => Object.keys(people)),
  createPersonSelector: (participantId?: string) => (state: RootState) =>
    (participantId && state.room.people[participantId]) || null,
  selectRoomBounds: (state: RootState) => state.room.bounds,
  selectHasWhiteboard: (state: RootState) =>
    Object.values(state.room.widgets).some((widget) => widget.type === WidgetType.Whiteboard),
  selectWallpaperUrl: (state: RootState) => state.room.wallpaperUrl,
  createEmojiSelector: (personId: string) => (state: RootState) => state.room.people[personId]?.emoji,
  selectUseSpatialAudio: (state: RootState) => state.room.useSpatialAudio,
  createPersonAvatarSelector: (personId: string) => (state: RootState) => state.room.people[personId]?.avatar,
  createPersonIsSpeakingSelector: (personId?: string) => (state: RootState) =>
    personId && !!state.room.people[personId]?.isSpeaking,
};
