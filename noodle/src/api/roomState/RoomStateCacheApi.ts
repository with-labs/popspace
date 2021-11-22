import { getAvatarFromUserId } from '@constants/AvatarMetadata';
import { SIZE_AVATAR } from '@features/room/people/constants';
import { logger } from '@utils/logger';
import { WritableDraft } from 'immer/dist/internal';

import { exportRoomTemplate } from './exportRoomTemplate';
import { RoomCursorStateShape, RoomStateShape } from './roomStateStore';
import { sanityCheckWidget } from './sanityCheckWidget';
import { RoomDetailsStateShape, RoomPositionState, RoomWallpaper } from './types/common';
import { ActorShape, ParticipantState } from './types/participants';
import { IncomingAuthResponseMessage, IncomingParticipantJoinedMessage } from './types/socketProtocol';
import { WidgetShape, WidgetState, ChatMessageShape, ChatWidgetShape } from './types/widgets';

const createEmptyParticipantState = () => ({});

const initializeActor = (actor: ActorShape) => ({
  id: actor.id,
  displayName: actor.displayName ?? '',
  avatarName: actor.avatarName || getAvatarFromUserId(actor.id),
});

export class RoomStateCacheApi {
  constructor(
    public set: (fn: (draft: WritableDraft<RoomStateShape>) => void) => void,
    public get: () => RoomStateShape,
    private emptyState: RoomStateShape
  ) {}
  reset = () => {
    this.set((draft) => {
      draft.id = null;
      draft.widgets = {};
      draft.users = {};
      draft.state = this.emptyState.state;
      draft.widgetPositions = {};
      draft.userPositions = {};
      draft.sessionLookup = {};
      draft.cursors = {};
      draft.displayName = '';
    });
  };
  initialize = (init: IncomingAuthResponseMessage) => {
    logger.debug(`Initialize`, init);
    const {
      payload: { roomData: room, participants, self },
    } = init;
    this.set((draft) => {
      Object.assign(draft.state, room.state);
      draft.displayName = room.displayName;
      // reset widgets
      draft.widgets = {};
      for (const widget of room.widgets) {
        if (!sanityCheckWidget(widget)) {
          logger.error(`Invalid widget data from server init`, `Widget ID: ${widget.widgetId}`);
          continue;
        }

        const { transform, ...widgetInfo } = widget;
        draft.widgets[widget.widgetId] = widgetInfo;
        draft.widgetPositions[widget.widgetId] = transform;
      }
      // reset users
      draft.users = {};
      draft.sessionLookup = {};
      participants.forEach((session) => {
        this.addUserToState(draft, {
          sessionId: session.sessionId,
          actor: session.actor,
          participantState: session.participantState,
          isObserver: session.isObserver,
        });
        draft.userPositions[session.actor.id] = {
          size: session.transform.size || SIZE_AVATAR,
          position: session.transform.position,
        };
      });
      // add self, but don't include transform data - we wait for the
      // user to actually enter the room for that.
      this.addUserToState(draft, {
        actor: self.actor,
        participantState: self.participantState,
        sessionId: self.sessionId,
        isObserver: self.isObserver,
      });

      draft.wallpaper = room.wallpaper;

      draft.id = room.id.toString();
      // store our own sessionId, just so we know
      draft.sessionId = init.sender.sessionId;
      // housekeeping: clean up the zOrder list
      draft.state.zOrder = draft.state.zOrder.reduce<string[]>((newList, id) => {
        if (draft.widgets[id]) {
          newList.push(id);
        }
        return newList;
      }, []);
    });
  };
  private addUserToState = (
    state: Pick<RoomStateShape, 'users' | 'sessionLookup'>,
    data: {
      actor: ActorShape;
      sessionId: string;
      participantState: ParticipantState;
      isObserver: boolean;
    }
  ) => {
    const actorId = data.actor.id;
    const sessionId = data.sessionId;
    if (!state.users[actorId]) {
      state.users[actorId] = {
        id: actorId,
        actor: initializeActor(data.actor),
        // patch in an empty display name default to keep data consistent
        participantState: {
          ...createEmptyParticipantState(),
          ...(data.participantState as any),
        },
        sessionIds: new Set<string>(),
        isObserver: data.isObserver,
      };
    } else {
      Object.assign(state.users[actorId], {
        participantState: data.participantState,
        actor: data.actor,
        isObserver: data.isObserver,
      });
    }

    // participantId === session ID
    state.users[actorId].sessionIds.add(sessionId);
    // add to lookup table
    state.sessionLookup[sessionId] = actorId;

    return state;
  };
  addWidget = ({ transform, ...widget }: WidgetShape & { transform: RoomPositionState; creatorId: string }) => {
    this.set((draft) => {
      if (!sanityCheckWidget(widget)) {
        logger.error(`Invalid widget data from server addWidget`, `Widget ID: ${widget.widgetId}`);
        return;
      }

      draft.widgets[widget.widgetId] = widget;
      draft.widgetPositions[widget.widgetId] = transform;
      draft.state.zOrder.push(widget.widgetId);
    });
  };
  transformWidget = ({ widgetId: id, transform }: { widgetId: string; transform: Partial<RoomPositionState> }) => {
    this.set((draft) => {
      this.mergeTransformToState(draft.widgetPositions, id, transform);
    });
  };
  transformUser = ({ userId: id, transform }: { userId: string; transform: Partial<RoomPositionState> }) => {
    this.set((draft) => {
      this.mergeTransformToState(draft.userPositions, id, transform);
    });
  };
  private mergeTransformToState = (
    positions: Record<string, RoomPositionState>,
    id: string,
    transform: Partial<RoomPositionState>
  ) => {
    if (!id) throw new Error(`Tried to merge position of object without an ID`);

    if (!positions[id]) {
      positions[id] = {
        ...transform,
        position: transform.position || { x: 0, y: 0 },
        size: transform.size || { width: 140, height: 140 },
      };
    } else {
      if (transform.position) {
        positions[id].position = transform.position;
      }
      if (transform.size) {
        positions[id].size = transform.size;
      }
    }
  };
  updateWidget = (payload: { widgetId: string; widgetState: Partial<WidgetState> }) => {
    this.set((draft) => {
      if (!payload.widgetId) {
        logger.error(`Invalid widget data from server updateWidget: no widget ID`);
        return;
      }

      if (draft.widgets[payload.widgetId]) {
        Object.assign(draft.widgets[payload.widgetId].widgetState, payload.widgetState);
      }
    });
  };
  deleteWidget = ({ widgetId: id }: { widgetId: string }) => {
    this.set((draft) => {
      if (!id) {
        logger.error(`Invalid widget data from server deleteWidget: no widget ID`);
      }

      delete draft.widgets[id];
      delete draft.widgetPositions[id];
      const zIndex = draft.state.zOrder.indexOf(id);
      if (zIndex !== -1) {
        draft.state.zOrder.splice(zIndex, 1);
      }
    });
  };
  bringToFront = ({ widgetId: id }: { widgetId: string }) => {
    this.set((draft) => {
      draft.state.zOrder = [...draft.state.zOrder.filter((i) => i !== id), id];
    });
  };
  updateRoomState = (state: Partial<RoomDetailsStateShape>) => {
    this.set((draft) => {
      Object.assign(draft.state, state);
    });
  };
  addSession = (message: IncomingParticipantJoinedMessage) => {
    this.set((draft) => {
      this.addUserToState(draft, {
        actor: message.payload.actor,
        sessionId: message.sender.sessionId,
        participantState: message.payload.participantState,
        isObserver: message.payload.isObserver,
      });
      this.mergeTransformToState(draft.userPositions, message.sender.actorId, message.payload.transform);
    });
  };
  deleteSession = (payload: { sessionId: string }) => {
    this.set((draft) => {
      // lookup session user
      const userId = draft.sessionLookup[payload.sessionId];
      draft.users[userId]?.sessionIds?.delete(payload.sessionId);
      if (draft.users[userId]?.sessionIds.size === 0) {
        // that was the last session, remove the user.
        // someday we may mark them as 'inactive' instead here
        delete draft.users[userId];
        delete draft.userPositions[userId];
        delete draft.cursors[userId];
      }
      // cleanup entry in session lookup table
      delete draft.sessionLookup[payload.sessionId];
    });
  };
  // ID is required, everything else is optional.
  updateUser = (payload: {
    id: string;
    participantState?: Partial<ParticipantState>;
    actor?: Partial<ActorShape>;
    isObserver?: boolean;
  }) => {
    this.set((draft) => {
      if (!draft.users[payload.id]) return;
      Object.assign(draft.users[payload.id].participantState, payload.participantState);
      if (payload.participantState) {
        Object.assign(draft.users[payload.id].participantState, payload.participantState);
      }
      if (payload.actor) {
        Object.assign(draft.users[payload.id].actor, payload.actor);
      }
      if (payload.isObserver !== undefined) {
        draft.users[payload.id].isObserver = payload.isObserver;
      }
    });
  };
  updateCursor = (payload: { userId: string; cursorState: RoomCursorStateShape }) => {
    this.set((draft) => {
      draft.cursors[payload.userId] = payload.cursorState;
    });
  };
  exportTemplate = () => {
    return exportRoomTemplate(this.get());
  };
  getCurrentUser = () => {
    const { sessionLookup, users, sessionId } = this.get();
    if (!sessionId) return null;
    const userId = sessionLookup[sessionId];
    if (!userId) return null;
    return users[userId] || null;
  };
  updateRoomWallpaper = (wallpaper: RoomWallpaper | null) => {
    this.set((draft) => {
      draft.wallpaper = wallpaper;
    });
  };
  addMessage = (widgetId: string, message: ChatMessageShape) => {
    this.set((draft) => {
      if (!widgetId) {
        logger.error(`Invalid widget data from server addMessage: no widget ID`);
        return;
      }

      if (!draft.widgets[widgetId]) return;

      const currentChat = draft.widgets[widgetId] as ChatWidgetShape;
      if (currentChat.messages.messageList) {
        currentChat.messages.messageList.push(message);
      } else {
        currentChat.messages.messageList = [message];
      }
    });
  };
  updateChatHistory = (widgetId: string, messages: { hasMoreToLoad: boolean; messageList: ChatMessageShape[] }) => {
    this.set((draft) => {
      if (!widgetId) {
        logger.error(`Invalid widget data from server updateChatHistory: no widget ID`);
        return;
      }

      if (!draft.widgets[widgetId]) return;

      const currentChat = draft.widgets[widgetId] as ChatWidgetShape;

      currentChat.messages.hasMoreToLoad = messages.hasMoreToLoad;
      currentChat.messages.messageList.unshift(...messages.messageList);
    });
  };
}
