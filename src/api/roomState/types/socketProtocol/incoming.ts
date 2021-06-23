import { WidgetShape, WidgetState } from '../widgets';
import { ActorShape, ParticipantShape, ParticipantState } from '../participants';
import { RoomDetailsStateShape, RoomPositionState } from '../common';
import { PassthroughPayload } from '../passthrough';
import { Actor } from '@api/types';

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

// room initialize message
export interface IncomingAuthResponseMessage extends BaseIncomingSocketMessage {
  kind: 'auth.response';
  payload: {
    participants: {
      authenticated: boolean;
      actor: { id: string; displayName: string; avatarName: string };
      sessionId: string;
      participantState: ParticipantState;
      roomId: string;
      transform: RoomPositionState;
    }[];
    self: ParticipantShape & { actor: { id: string } };
    displayName: string;
    roomData: {
      widgets: (WidgetShape & { transform: RoomPositionState })[];
      id: string | number; // TODO: clarify
      state: RoomDetailsStateShape;
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

export type IncomingSocketMessage =
  | IncomingPongMessage
  | IncomingErrorMessage
  | IncomingAuthResponseMessage
  | IncomingJoinResponseMessage
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
  | IncomingActorUpdatedMessage;

// util types for mapping discriminated union by keys
type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;
type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = {
  [V in T[K]]: DiscriminateUnion<T, K, V>;
};

export type IncomingSocketMessageByKind = MapDiscriminatedUnion<IncomingSocketMessage, 'kind'>;
