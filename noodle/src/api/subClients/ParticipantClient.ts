import { ApiCoreClient } from '@api/ApiCoreClient';
import {
  IncomingActorUpdatedMessage,
  IncomingAvatarNameUpdatedMessage,
  IncomingDisplayNameUpdatedMessage,
  IncomingParticipantJoinedMessage,
  IncomingParticipantLeftMessage,
  IncomingParticipantUpdatedMessage,
  IncomingSetObserverResponseMessage,
} from '@api/roomState/types/socketProtocol';
import { ApiSubClient } from './ApiSubClient';

export class ParticipantClient extends ApiSubClient {
  constructor(core: ApiCoreClient) {
    super(core);
    core.socket.on('message:participantJoined', this.onParticipantJoined);
    core.socket.on('message:participantLeft', this.onParticipantLeft);
    core.socket.on('message:participantUpdated', this.onParticipantUpdated);
    core.socket.on('message:actorUpdated', this.onActorUpdated);
    core.socket.on('message:displayNameUpdated', this.onDisplayNameUpdated);
    core.socket.on('message:avatarNameUpdated', this.onAvatarNameUpdated);
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
      isObserver: message.payload.isObserver,
    });
  };

  private onActorUpdated = (message: IncomingActorUpdatedMessage) => {
    this.core.cacheApi.updateUser({
      id: message.sender.actorId,
      actor: message.payload.actor,
    });
  };

  private onDisplayNameUpdated = (message: IncomingDisplayNameUpdatedMessage) => {
    this.core.cacheApi.updateUser({
      id: message.sender.actorId,
      actor: {
        displayName: message.payload.displayName,
      },
    });
  };

  private onAvatarNameUpdated = (message: IncomingAvatarNameUpdatedMessage) => {
    this.core.cacheApi.updateUser({
      id: message.sender.actorId,
      actor: {
        avatarName: message.payload.avatarName,
      },
    });
  };

  // Public API

  enterMeeting = async () => {
    if (!this.core.actor) {
      throw new Error('Must be authenticated to enter meeting');
    }
    if (!this.core.roomId) {
      throw new Error('Must be connected to a meeting to join');
    }

    const response = await this.core.socket.sendAndWaitForResponse<IncomingSetObserverResponseMessage>({
      kind: 'setObserver',
      payload: {
        isObserver: false,
      },
    });

    this.core.cacheApi.updateUser({
      id: response.payload.actor.id,
      isObserver: response.payload.isObserver,
    });
  };

  updateDisplayName = (displayName: string) => {
    if (!this.core.actor) {
      throw new Error('Must be authenticated to update display name');
    }

    this.core.cacheApi.updateUser({ actor: { displayName }, id: this.core.actor.actorId });
    this.core.socket.send({
      kind: 'updateSelfDisplayName',
      payload: { displayName },
    });
  };

  updateAvatarName = (avatarName: string) => {
    if (!this.core.actor) {
      throw new Error('Must be authenticated to update avatar name');
    }

    this.core.cacheApi.updateUser({ actor: { avatarName }, id: this.core.actor.actorId });
    this.core.socket.send({
      kind: 'updateSelfAvatarName',
      payload: { avatarName },
    });
  };
}
