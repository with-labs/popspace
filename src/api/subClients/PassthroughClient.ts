import { ApiCoreClient } from '@api/ApiCoreClient';
import { RoomCursorStateShape } from '@api/roomState/roomStateStore';
import { IncomingPassthroughMessage } from '@api/roomState/types/socketProtocol';
import { ApiSubClient } from './ApiSubClient';

export class PassthroughClient extends ApiSubClient {
  constructor(core: ApiCoreClient) {
    super(core);
    core.socket.on('message:passthrough', this.onPassthrough);
  }

  private onPassthrough = (message: IncomingPassthroughMessage) => {
    switch (message.payload.kind) {
      case 'cursorUpdate':
        this.core.cacheApi.updateCursor(message.payload);
    }
  };

  updateCursor = (payload: RoomCursorStateShape) => {
    if (!this.core.actor) {
      throw new Error('Must authenticate to send cursor position');
    }

    this.core.socket.send({
      kind: 'passthrough',
      payload: {
        kind: 'cursorUpdate',
        userId: this.core.actor.actorId,
        cursorState: payload,
      },
    });
  };
}
