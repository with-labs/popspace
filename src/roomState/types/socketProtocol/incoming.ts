import { WidgetShape, WidgetState } from '../widgets';
import { ParticipantShape, ParticipantState } from '../participants';
import { RoomPositionState } from '../common';

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
    userId: string;
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
    participants: (ParticipantShape & {
      transform: RoomPositionState;
    })[];
    self: ParticipantShape;
    room: {
      widgets: (WidgetShape & { transform: RoomPositionState })[];
      id: string | number; // TODO: clarify
      state: {
        wallpaperUrl: string;
        displayName: string;
        isCustomWallpaper: boolean;
        zOrder?: string[];
      };
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
    displayName: string;
  };
}

export interface IncomingParticipantUpdatedMessage extends BaseIncomingSocketMessage {
  kind: 'participantUpdated';
  // incoming payloads have partial participantState
  payload: Omit<ParticipantShape, 'participantState'> & {
    participantState: Partial<ParticipantState>;
  };
}

export interface IncomingParticipantLeftMessage extends BaseIncomingSocketMessage {
  kind: 'participantLeft';
  payload: {
    sessionId: string;
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
  | IncomingRoomStateUpdatedMessage;
