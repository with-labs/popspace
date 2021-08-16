import { RoomDetailsStateShape, RoomPositionState, RoomWallpaper } from '../common';
import { ActorShape, ParticipantShape, ParticipantState } from '../participants';
import { PassthroughPayload } from '../passthrough';
import { WidgetShape, WidgetState, ChatMessageShape } from '../widgets';

/**
 * Incoming socket message protocol type definitions.
 *
 * - All incoming socket message shapes should begin with "Incoming"
 * - All incoming messages should be added to the IncomingSocketMessage union
 */

// common properties of all incoming messages
interface BaseIncomingSocketMessage {
  requestId?: string;
  sender: {
    actorId: string;
    sessionId: string;
  };
}

export interface IncomingPongMessage extends BaseIncomingSocketMessage {
  kind: 'pong';
}

export interface IncomingAuthResponseMessage extends BaseIncomingSocketMessage {
  kind: 'auth.response';
  payload: {
    participants: {
      authenticated: boolean;
      actor: ActorShape;
      sessionId: string;
      participantState: ParticipantState;
      roomId: string;
      transform: RoomPositionState;
      isObserver: boolean;
    }[];
    self: ParticipantShape & { actor: { id: string } };
    roomData: {
      displayName: string;
      widgets: (WidgetShape & { transform: RoomPositionState })[];
      id: string | number; // TODO: clarify
      state: RoomDetailsStateShape;
      wallpaper: RoomWallpaper | null;
    };
  };
}

export interface IncomingWidgetCreatedMessage extends BaseIncomingSocketMessage {
  kind: 'widgetCreated';
  payload: WidgetShape & { transform: RoomPositionState };
}

export interface IncomingParticipantJoinedMessage extends BaseIncomingSocketMessage {
  kind: 'participantJoined';
  payload: ParticipantShape & {
    transform: RoomPositionState;
  };
}

export interface IncomingErrorMessage extends BaseIncomingSocketMessage {
  kind: 'error';
  code: string;
  message: string;
}

export interface IncomingWidgetMovedMessage extends BaseIncomingSocketMessage {
  kind: 'widgetTransformed';
  payload: {
    widgetId: string;
    transform: RoomPositionState;
  };
}

export interface IncomingParticipantMovedMessage extends BaseIncomingSocketMessage {
  kind: 'participantTransformed';
  payload: {
    transform: RoomPositionState;
  };
}

export interface IncomingWidgetUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'widgetUpdated';
  // incoming update payloads have partial widgetState
  payload: Omit<WidgetShape, 'widgetState'> & {
    widgetState: Partial<WidgetState>;
  };
}

export interface IncomingWidgetDeletedMessage extends BaseIncomingSocketMessage {
  kind: 'widgetDeleted';
  payload: { widgetId: string };
}

export interface IncomingRoomStateUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'roomStateUpdated';
  payload: {
    wallpaperUrl: string;
    width: number;
    height: number;
  };
}

export interface IncomingParticipantUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'participantUpdated';
  // incoming payloads have partial participantState
  payload: Omit<ParticipantShape, 'participantState'> & {
    participantState: Partial<ParticipantState>;
  };
}

export interface IncomingActorUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'actorUpdated';
  payload: {
    actor: ActorShape;
  };
}

export interface IncomingParticipantLeftMessage extends BaseIncomingSocketMessage {
  kind: 'participantLeft';
  payload: {
    sessionId: string;
  };
}

export interface IncomingPassthroughMessage<T extends PassthroughPayload = PassthroughPayload>
  extends BaseIncomingSocketMessage {
  kind: 'passthrough';
  payload: T;
}

export interface IncomingSetObserverResponseMessage extends BaseIncomingSocketMessage {
  kind: 'setObserver.response';
  payload: ParticipantShape;
}

export interface IncomingDisplayNameUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'displayNameUpdated';
  payload: { displayName: string };
}

export interface IncomingAvatarNameUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'avatarNameUpdated';
  payload: { avatarName: string };
}

export interface IncomingWallpaperUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'wallpaperUpdated';
  payload: { wallpaper: RoomWallpaper };
}

export interface IncomingChatUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'chatMessageCreated';
  payload: {
    widgetId: string;
    message: ChatMessageShape;
  };
}

export interface IncomingGetMoreChatMessage extends BaseIncomingSocketMessage {
  kind: 'getMoreChatMessages.response';
  payload: {
    widgetId: string;
    messages: {
      hasMoreToLoad: boolean;
      messageList: ChatMessageShape[];
    };
  };
}

export type IncomingSocketMessage =
  | IncomingPongMessage
  | IncomingErrorMessage
  | IncomingAuthResponseMessage
  | IncomingWidgetCreatedMessage
  | IncomingParticipantJoinedMessage
  | IncomingWidgetMovedMessage
  | IncomingParticipantMovedMessage
  | IncomingWidgetUpdatedMessage
  | IncomingWidgetDeletedMessage
  | IncomingParticipantLeftMessage
  | IncomingParticipantUpdatedMessage
  | IncomingRoomStateUpdatedMessage
  | IncomingPassthroughMessage
  | IncomingActorUpdatedMessage
  | IncomingSetObserverResponseMessage
  | IncomingDisplayNameUpdatedMessage
  | IncomingAvatarNameUpdatedMessage
  | IncomingWallpaperUpdatedMessage
  | IncomingChatUpdatedMessage
  | IncomingGetMoreChatMessage;

// util types for mapping discriminated union by keys
type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;
type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = {
  [V in T[K]]: DiscriminateUnion<T, K, V>;
};

export type IncomingSocketMessageByKind = MapDiscriminatedUnion<IncomingSocketMessage, 'kind'>;
