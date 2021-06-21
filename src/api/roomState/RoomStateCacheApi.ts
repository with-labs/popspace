import { randomSectionAvatar } from '@constants/AvatarMetadata';
import { SIZE_AVATAR } from '@features/room/people/constants';
import { logger } from '@utils/logger';
import { WritableDraft } from 'immer/dist/internal';
import { exportRoomTemplate } from './exportRoomTemplate';
import { RoomCursorStateShape, RoomStateShape } from './roomStateStore';
import { sanityCheckWidget } from './sanityCheckWidget';
import { RoomDetailsStateShape, RoomPositionState } from './types/common';
import { ParticipantState } from './types/participants';
import { IncomingAuthResponseMessage, IncomingParticipantJoinedMessage } from './types/socketProtocol';
import { WidgetShape, WidgetState } from './types/widgets';

const createEmptyParticipantState = (actorId: string) => ({
  displayName: '',
  avatarName: randomSectionAvatar('brandedPatterns', actorId),
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
      payload: { roomData: room, participants, displayName },
    } = init;
    this.set((draft) => {
      Object.assign(draft.state, room.state);
      draft.displayName = displayName;
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
          actorId: session.actor.id,
          participantState: session.participantState,
        });
        draft.userPositions[session.actor.id] = {
          size: session.transform.size || SIZE_AVATAR,
          position: session.transform.position,
        };
      });
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
      actorId: string;
      sessionId: string;
      participantState: ParticipantState;
    }
  ) => {
    const actorId = data.actorId;
    const sessionId = data.sessionId;
    if (!state.users[actorId]) {
      state.users[actorId] = {
        id: actorId,
        // patch in an empty display name default to keep data consistent
        participantState: {
          ...createEmptyParticipantState(actorId),
          ...(data.participantState as any),
        },
        sessionIds: new Set<string>(),
      };
    } else {
      Object.assign(state.users[actorId], {
        participantState: data.participantState,
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
        actorId: message.sender.actorId,
        sessionId: message.sender.sessionId,
        participantState: message.payload.participantState,
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
  updateUser = (payload: { id: string; participantState: Partial<ParticipantState> }) => {
    this.set((draft) => {
      if (!draft.users[payload.id]) return;
      Object.assign(draft.users[payload.id].participantState, payload.participantState);
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
}
