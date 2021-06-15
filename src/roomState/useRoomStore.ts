import create from 'zustand';
import { SocketConnection } from './SocketConnection';
import { Vector2, Bounds } from '../types/spatials';
import { logger } from '@utils/logger';
import {
  IncomingAuthResponseMessage,
  IncomingSocketMessage,
  IncomingWidgetCreatedMessage,
  OutgoingSocketMessage,
} from './types/socketProtocol';
import { combineAndImmer } from './combineAndImmer';
import { wallPaperOptions } from '@features/roomControls/roomSettings/WallpaperOptions';
import { WidgetShape, WidgetType, WidgetStateByType, WidgetState } from './types/widgets';
import { ParticipantShape, ParticipantState } from './types/participants';
import { RoomDetailsStateShape, RoomPositionState } from './types/common';
import { devtools } from 'zustand/middleware';
import { Analytics } from '@analytics/Analytics';
import { EventNames, Origin } from '@analytics/constants';
import { sanityCheckWidget } from './sanityCheckWidget';
import { SIZE_AVATAR } from '@features/room/people/constants';
import { useOnboarding } from '@features/onboarding/useOnboarding';
import { areTransformsEqual } from './utils';
import { exportRoomTemplate } from './exportRoomTemplate';
import { randomAvatar } from '@utils/AvatarOptions';

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
  authenticated: boolean;
  sessionIds: Set<string>;
};

export type RoomCursorStateShape = {
  position: Vector2;
  active: boolean;
};

export type RoomStateShape = {
  id: string | null;
  widgets: Record<string, WidgetShape & { ownerId: string }>;
  users: Record<string, RoomUserStateShape>;
  /** Allows finding users based on session IDs */
  sessionLookup: Record<string, string>;
  state: RoomDetailsStateShape;
  widgetPositions: Record<string, RoomPositionState>;
  userPositions: Record<string, RoomPositionState>;
  socket: SocketConnection | null;
  sessionId: string | null;
  cursors: Record<string, RoomCursorStateShape>;
  displayName: string;
};

const emptyState: RoomStateShape = {
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
  socket: null,
  sessionId: null,
  cursors: {},
};

const createEmptyParticipantState = (actorId: string) => ({
  displayName: '',
  avatarName: randomAvatar(actorId).name,
});

// this requires some additional logic to reshape the user payload information
function addUserToState(state: Pick<RoomStateShape, 'users' | 'sessionLookup'>, participant: ParticipantShape) {
  if (!state.users[participant.actor.id]) {
    state.users[participant.actor.id] = {
      ...participant.actor,
      // patch in an empty display name default to keep data consistent
      participantState: {
        ...createEmptyParticipantState(participant.actor.id),
        ...(participant.participantState as any),
      },
      authenticated: participant.authenticated,
      sessionIds: new Set<string>(),
    };
  } else {
    Object.assign(state.users[participant.actor.id], {
      ...participant.actor,
      participantState: participant.participantState,
      authenticated: participant.authenticated,
    });
  }

  // participantId === session ID
  state.users[participant.actor.id].sessionIds.add(participant.sessionId);
  // add to lookup table
  state.sessionLookup[participant.sessionId] = participant.actor.id;

  return state;
}

// extracted to a common function as this is used often
function mergeTransformToState(
  positions: Record<string, RoomPositionState>,
  id: string,
  transform: Partial<RoomPositionState>
) {
  if (!id) throw new Error(`Tried to merge position of object without an ID`);

  if (!positions[id]) {
    positions[id] = {
      ...transform,
      position: transform.position || { x: 0, y: 0 },
      size: transform.size || { width: 140, height: 80 },
    };
  } else {
    if (transform.position) {
      positions[id].position = transform.position;
    }
    if (transform.size) {
      positions[id].size = transform.size;
    }
  }
}

function createRoomStore() {
  const store = create(
    devtools(
      combineAndImmer(emptyState, (set, get) => {
        /**
         * The internal API handles raw store data transformation
         * for each kind of action. It's the primary engine of our
         * local room state.
         */
        const internalApi = {
          reset() {
            set((draft) => {
              draft.id = null;
              draft.widgets = {};
              draft.users = {};
              draft.state = emptyState.state;
              draft.widgetPositions = {};
              draft.userPositions = {};
              draft.sessionLookup = {};
              draft.socket = null;
              draft.cursors = {};
            });
          },
          initialize(init: IncomingAuthResponseMessage) {
            logger.debug(`Initialize`, init);
            const {
              payload: { roomData: room, participants },
            } = init;
            set((draft) => {
              Object.assign(draft.state, room.state);
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
                addUserToState(draft, session);
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
          },
          addWidget({ transform, ...widget }: WidgetShape & { transform: RoomPositionState; ownerId: string }) {
            set((draft) => {
              if (!sanityCheckWidget(widget)) {
                logger.error(`Invalid widget data from server addWidget`, `Widget ID: ${widget.widgetId}`);
                return;
              }

              draft.widgets[widget.widgetId] = widget;
              draft.widgetPositions[widget.widgetId] = transform;
              draft.state.zOrder.push(widget.widgetId);
            });
          },
          transformWidget({ widgetId: id, transform }: { widgetId: string; transform: Partial<RoomPositionState> }) {
            set((draft) => {
              mergeTransformToState(draft.widgetPositions, id, transform);
            });
          },
          transformUser({ userId: id, transform }: { userId: string; transform: Partial<RoomPositionState> }) {
            set((draft) => {
              mergeTransformToState(draft.userPositions, id, transform);
            });
          },
          updateWidget(payload: { widgetId: string; widgetState: Partial<WidgetState> }) {
            set((draft) => {
              if (!payload.widgetId) {
                logger.error(`Invalid widget data from server updateWidget: no widget ID`);
                return;
              }

              if (draft.widgets[payload.widgetId]) {
                Object.assign(draft.widgets[payload.widgetId].widgetState, payload.widgetState);
              }
            });
          },
          deleteWidget({ widgetId: id }: { widgetId: string }) {
            set((draft) => {
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
          },
          bringToFront({ widgetId: id }: { widgetId: string }) {
            set((draft) => {
              draft.state.zOrder = [...draft.state.zOrder.filter((i) => i !== id), id];
            });
          },
          updateRoomState(state: Partial<RoomDetailsStateShape>) {
            set((draft) => {
              Object.assign(draft.state, state);
            });
          },
          addSession(payload: ParticipantShape & { transform: RoomPositionState }) {
            set((draft) => {
              addUserToState(draft, payload);
              mergeTransformToState(draft.userPositions, payload.actor.id, payload.transform);
            });
          },
          deleteSession(payload: { sessionId: string }) {
            set((draft) => {
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
          },
          // ID is required, everything else is optional.
          updateUser(payload: { id: string; participantState: Partial<ParticipantState> }) {
            set((draft) => {
              if (!draft.users[payload.id]) return;
              Object.assign(draft.users[payload.id].participantState, payload.participantState);
            });
          },
          updateCursor(payload: { userId: string; cursorState: RoomCursorStateShape }) {
            set((draft) => {
              draft.cursors[payload.userId] = payload.cursorState;
            });
          },
        };

        /**
         * We will connect Socket messages to the internal API so that
         * incoming messages correctly modify the local state
         */
        const onSocketMessage = (message: IncomingSocketMessage) => {
          switch (message.kind) {
            case 'auth.response':
              return internalApi.initialize(message);
            case 'widgetCreated':
              return internalApi.addWidget(message.payload);
            case 'widgetUpdated':
              return internalApi.updateWidget(message.payload);
            case 'widgetDeleted':
              return internalApi.deleteWidget(message.payload);
            case 'widgetTransformed':
              return internalApi.transformWidget(message.payload);
            case 'participantJoined':
              return internalApi.addSession(message.payload);
            case 'participantLeft':
              return internalApi.deleteSession(message.payload);
            case 'participantTransformed':
              return internalApi.transformUser({
                userId: message.sender.userId,
                transform: message.payload.transform,
              });
            case 'participantUpdated':
              return internalApi.updateUser({
                id: message.sender.userId,
                participantState: message.payload.participantState,
              });
            case 'roomStateUpdated':
              return internalApi.updateRoomState(message.payload);
            case 'passthrough':
              switch (message.payload.kind) {
                case 'cursorUpdate':
                  return internalApi.updateCursor(message.payload);
              }
          }
        };

        /**
         * Helper to send messages to the current socket connection
         */
        const sendMessage = (message: OutgoingSocketMessage) => {
          const socket = get().socket;
          if (!socket) {
            // this means that we sent a message before the socket was connected to the
            // store - which means we let the user into the room before setup was complete.
            // Should not happen, so be loud if it does.
            logger.critical(
              `Message not sent: `,
              message,
              'Room state cannot be modified before the socket is connected!'
            );
            throw new Error('Invalid socket state');
          } else {
            socket.send(message);
          }
        };

        const sendMessageWithResponse = <M extends IncomingSocketMessage>(message: OutgoingSocketMessage) => {
          const socket = get().socket;
          if (!socket) {
            logger.critical(
              `Message not sent: `,
              message,
              'Room state cannot be modified before the socket is connected!'
            );
            throw new Error('Invalid socket state');
          } else {
            return socket.sendAndWaitForResponse<M>(message);
          }
        };

        function getOwnUserId() {
          const { sessionId, sessionLookup } = get();
          if (sessionId === null) {
            throw new Error('Tried to update self without a valid session');
          }
          const userId = sessionLookup[sessionId];
          if (!userId) {
            throw new Error('Session ID active, but no user found in state for ' + sessionId);
          }
          return userId;
        }

        function getRoomId() {
          const { id } = get();
          return id;
        }

        /**
         * The external API is called by our client. It handles socket
         * interaction and delegates to the internal API for optimistic
         * changes if necessary.
         */
        const externalApi = {
          /**
           * Connects a SocketConnection to this store. Incoming messages
           * will modify store state. Any previous socket connection will
           * be disconnected.
           */
          connect(socket: SocketConnection) {
            // unsubscribe any old socket
            const existingSocket = get().socket;
            if (existingSocket) {
              existingSocket.off('message', onSocketMessage);
            }

            // reset the state for a new connection
            internalApi.reset();

            // store the new socket in our state
            set((current) => {
              current.socket = socket;
            });

            // subscribe to incoming messages
            socket.on('message', onSocketMessage);
          },
          /**
           * Creates a widget. You can await the call to receive the
           * final widget state with ID once it has been returned
           * from the server.
           */
          async addWidget<Type extends WidgetType>(
            payload: {
              type: Type;
              widgetState: WidgetStateByType[Type];
              transform: RoomPositionState;
            },
            origin?: Origin
          ) {
            if (!payload.widgetState || !payload.type) {
              throw new Error(
                `Error creating widget: invalid data. Widget type: ${
                  payload?.type
                } Widget state is provided: ${!!payload?.widgetState}`
              );
            }
            // we don't know the Widget ID until the server rebroadcasts
            // this event to everyone with the ID provided - so there is no
            // optimistic change, just sending the event.
            const response = await sendMessageWithResponse<IncomingWidgetCreatedMessage>({
              kind: 'createWidget',
              payload,
            });

            // track the widget creation event
            Analytics.trackEvent(EventNames.CREATE_WIDGET, {
              type: response.payload.type,
              roomId: getRoomId(),
              creationLocation: origin || Origin.NOT_SET,
            });
            // update onboarding
            useOnboarding.getState().api.markComplete('hasCreated');
            // the incoming created message will be handled by the main incoming message
            return response.payload;
          },
          async transformSelf(payload: Partial<RoomPositionState>) {
            const userId = getOwnUserId();
            const currentTransform = get().userPositions[userId] || {};
            const updatedTransform = {
              ...currentTransform,
              ...payload,
            };
            // bail if transform has no effect
            if (!!currentTransform && areTransformsEqual(currentTransform, updatedTransform)) return;
            // optimistic update
            internalApi.transformUser({ userId, transform: updatedTransform });
            // update onboarding
            useOnboarding.getState().api.markComplete('hasMoved');
            // send to peers
            await sendMessageWithResponse({
              kind: 'transformSelf',
              payload: {
                transform: updatedTransform,
              },
            });
          },
          /** @deprecated use transformWidget */
          async moveWidget(payload: { widgetId: string; position: Vector2 }) {
            internalApi.transformWidget({ widgetId: payload.widgetId, transform: { position: payload.position } });
            await sendMessageWithResponse({
              kind: 'transformWidget',
              payload: {
                widgetId: payload.widgetId,
                transform: {
                  position: payload.position,
                },
              },
            });
          },
          /** @deprecated use transformWidget */
          resizeWidget(payload: { widgetId: string; size: Bounds }) {
            internalApi.transformWidget({ widgetId: payload.widgetId, transform: { size: payload.size } });
            sendMessage({
              kind: 'transformWidget',
              payload: {
                widgetId: payload.widgetId,
                transform: {
                  size: payload.size,
                },
              },
            });
          },
          async transformWidget(payload: { widgetId: string; transform: Partial<RoomPositionState> }) {
            const currentTransform = get().widgetPositions[payload.widgetId];
            const updatedTransform = {
              ...currentTransform,
              ...payload.transform,
            };
            internalApi.transformWidget({ widgetId: payload.widgetId, transform: updatedTransform });
            await sendMessageWithResponse({
              kind: 'transformWidget',
              payload: {
                widgetId: payload.widgetId,
                transform: updatedTransform,
              },
            });
          },
          updateWidget(payload: { widgetId: string; widgetState: Partial<WidgetState> }) {
            internalApi.updateWidget(payload);
            sendMessage({
              kind: 'updateWidget',
              payload,
            });

            Analytics.trackWidgetUpdateEvent(getRoomId(), payload.widgetState);
          },
          deleteWidget(payload: { widgetId: string }) {
            internalApi.deleteWidget(payload);
            sendMessage({
              kind: 'deleteWidget',
              payload,
            });
          },
          bringToFront(payload: { widgetId: string }) {
            internalApi.bringToFront(payload);
            sendMessage({
              kind: 'updateRoomState',
              payload: get().state,
            });
          },
          updateRoomState(payload: Partial<RoomDetailsStateShape>) {
            const defaulted = { ...get().state, ...payload };
            internalApi.updateRoomState(defaulted);
            sendMessage({
              kind: 'updateRoomState',
              payload: defaulted,
            });
            // track the wallpaper change event
            if (payload.wallpaperUrl) {
              Analytics.trackEvent(EventNames.CHANGED_WALLPAPER, {
                roomId: getRoomId(),
                isCustomWallpaper: payload.isCustomWallpaper,
              });
            }
          },
          updateSelf(payload: Partial<ParticipantState>) {
            internalApi.updateUser({ participantState: payload, id: getOwnUserId() });
            sendMessage({
              kind: 'updateSelf',
              payload: {
                participantState: payload,
              },
            });

            // track user events analytics
            Analytics.trackUserEvent(getRoomId(), payload);
          },
          leave() {
            get().socket?.close();
            internalApi.reset();
          },
          updateCursor(payload: RoomCursorStateShape) {
            sendMessage({
              kind: 'passthrough',
              payload: {
                kind: 'cursorUpdate',
                userId: getOwnUserId(),
                cursorState: payload,
              },
            });
          },
          getActiveUserId() {
            return getOwnUserId();
          },
          exportTemplate() {
            return exportRoomTemplate(get());
          },
        };

        return {
          api: externalApi,
        };
      }),
      'RoomStore'
    )
  );

  return store;
}

export const useRoomStore = createRoomStore();

// for debug
(window as any).roomStore = useRoomStore;
