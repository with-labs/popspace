import { RoomDetailsStateShape, RoomPositionState } from '../common';
import { PassthroughPayload } from '../passthrough';
import { WidgetShape, WidgetShapeForType } from '../widgets';

/**
 * Outgoing socket message protocol type definitions.
 *
 * - All outgoing socket message shapes should begin with "Outgoing"
 * - All outgoing messages should be added to the OutgoingSocketMessage union
 */

// common properties of all outgoing messages
interface BaseOutgoingSocketMessage {}

// demo message, pings server
export interface PingMessage extends BaseOutgoingSocketMessage {
  kind: 'ping';
}

export interface AuthMessage extends BaseOutgoingSocketMessage {
  kind: 'auth';
  payload: {
    roomRoute: string;
    token: string;
    isObserver?: boolean;
  };
}

export interface JoinMessage extends BaseOutgoingSocketMessage {
  kind: 'setObserver';
  payload: {
    isObserver: boolean;
  };
}

export interface OutgoingAddWidgetMessage extends BaseOutgoingSocketMessage {
  kind: 'createWidget';
  payload: Omit<WidgetShape, 'widgetId' | 'creatorId' | 'creatorDisplayName'> & {
    transform: RoomPositionState;
  };
}

export interface OutgoingMoveWidgetMessage extends BaseOutgoingSocketMessage {
  kind: 'transformWidget';
  payload: {
    widgetId: string;
    transform: Partial<RoomPositionState>;
  };
}

export interface OutgoingMoveParticipantMessage extends BaseOutgoingSocketMessage {
  kind: 'transformSelf';
  payload: {
    transform: Partial<RoomPositionState>;
  };
}

export interface OutgoingDeleteWidgetMessage extends BaseOutgoingSocketMessage {
  kind: 'deleteWidget';
  payload: { widgetId: string };
}

export interface OutgoingUpdateParticipantMessage extends BaseOutgoingSocketMessage {
  kind: 'updateSelf';
  payload: {
    participantState: {
      displayName?: string;
      avatarName?: string;
    };
  };
}

export interface OutgoingUpdateSelfDisplayNameMessage extends BaseOutgoingSocketMessage {
  kind: 'updateSelfDisplayName';
  payload: {
    displayName: string;
  };
}

export interface OutgoingUpdateSelfAvatarNameMessage extends BaseOutgoingSocketMessage {
  kind: 'updateSelfAvatarName';
  payload: {
    avatarName: string;
  };
}

/**
 * Makes payload partial - users may provide a subset
 * of the fields on update.
 */
type PartialWidgetShape = {
  [K in keyof WidgetShapeForType<any>]: K extends 'widgetState' ? Partial<WidgetShape[K]> : WidgetShapeForType<any>[K];
};
export interface OutgoingUpdateWidgetMessage extends BaseOutgoingSocketMessage {
  kind: 'updateWidget';
  payload: PartialWidgetShape;
}

export interface OutgoingLeaveMessage extends BaseOutgoingSocketMessage {
  kind: 'leave';
  payload: Record<string, never>;
}

export interface OutgoingUpdateRoomStateMessage extends BaseOutgoingSocketMessage {
  kind: 'updateRoomState';
  payload: RoomDetailsStateShape;
}

export interface OutgoingUpdateMicState extends BaseOutgoingSocketMessage {
  kind: 'updateMicState';
  payload: {
    isOn: boolean;
    timestamp: number;
  };
}

export interface OutgoingUpdateVideoState extends BaseOutgoingSocketMessage {
  kind: 'updateVideoState';
  payload: {
    isOn: boolean;
    timestamp: number;
  };
}

export interface OutgoingChatMessage extends BaseOutgoingSocketMessage {
  kind: 'createChatMessage';
  payload: {
    content: string;
  };
}

export interface OutgoingGetMoreChatMessage extends BaseOutgoingSocketMessage {
  kind: 'getMoreChatMessages';
  payload: {
    lastMessageId: string;
  };
}

export interface OutgoingPassthroughMessage<T extends PassthroughPayload = PassthroughPayload>
  extends BaseOutgoingSocketMessage {
  kind: 'passthrough';
  payload: T;
}

export interface OutgoingUpdateWallpaperMessage extends BaseOutgoingSocketMessage {
  kind: 'updateWallpaper';
  payload: {
    wallpaperId: string;
  };
}

export interface OutgoingUndoLastWidgetDeleteMessage extends BaseOutgoingSocketMessage {
  kind: 'undoLastWidgetDelete';
  payload: Record<string, never>;
}

export type OutgoingSocketMessage =
  | PingMessage
  | AuthMessage
  | JoinMessage
  | OutgoingAddWidgetMessage
  | OutgoingMoveWidgetMessage
  | OutgoingMoveParticipantMessage
  | OutgoingUpdateWidgetMessage
  | OutgoingDeleteWidgetMessage
  | OutgoingUpdateParticipantMessage
  | OutgoingLeaveMessage
  | OutgoingUpdateRoomStateMessage
  | OutgoingPassthroughMessage
  | OutgoingUpdateMicState
  | OutgoingUpdateVideoState
  | OutgoingUpdateSelfDisplayNameMessage
  | OutgoingUpdateSelfAvatarNameMessage
  | OutgoingUpdateWallpaperMessage
  | OutgoingUndoLastWidgetDeleteMessage
  | OutgoingChatMessage
  | OutgoingGetMoreChatMessage;
