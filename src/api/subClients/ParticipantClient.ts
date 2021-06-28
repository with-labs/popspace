import { Analytics } from '@analytics/Analytics';
import { ApiCoreClient } from '@api/ApiCoreClient';
import { ParticipantState } from '@api/roomState/types/participants';
import {
  IncomingActorUpdatedMessage,
  IncomingParticipantJoinedMessage,
  IncomingParticipantLeftMessage,
  IncomingParticipantUpdatedMessage,
} from '@api/roomState/types/socketProtocol';
import { ApiSubClient } from './ApiSubClient';

export class ParticipantClient extends ApiSubClient {
  constructor(core: ApiCoreClient) {
    super(core);
    core.socket.on('message:participantJoined', this.onParticipantJoined);
    core.socket.on('message:participantLeft', this.onParticipantLeft);
    core.socket.on('message:participantUpdated', this.onParticipantUpdated);
    core.socket.on('message:actorUpdated', this.onActorUpdated);
  }

  private onParticipantJoined = (message: IncomingParticipantJoinedMessage) => {
    this.core.cacheApi.addSession(message);
  };

  private onParticipantLeft = (message: IncomingParticipantLeftMessage) => {
    this.core.cacheApi.deleteSession(message.payload);
  };

  private onParticipantUpdated = (message: IncomingParticipantUpdatedMessage) => {
    this.core.cacheApi.updateUser({
      id: message.sender.actorId,
      participantState: message.payload.participantState,
    });
  };

  private onActorUpdated = (message: IncomingActorUpdatedMessage) => {
    this.core.cacheApi.updateUser({
      id: message.sender.actorId,
      actor: message.payload.actor,
    });
  };

  // Public API

  updateSelf = (payload: Partial<ParticipantState>) => {
    if (!this.core.actor) {
      throw new Error('Must be authenticated to update self');
    }

    this.core.cacheApi.updateUser({ participantState: payload, id: this.core.actor.actorId });
    this.core.socket.send({
      kind: 'updateSelfActor',
      payload: {
        actor: payload,
      },
    });

    // track user events analytics
    Analytics.trackUserEvent(this.core.roomId, payload);
  };
}
