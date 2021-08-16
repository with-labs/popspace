import { ApiCoreClient } from '@api/ApiCoreClient';
import { ApiSubClient } from './ApiSubClient';
import { IncomingChatUpdatedMessage, IncomingGetMoreChatMessage } from '@api/roomState/types/socketProtocol';
import client from '@api/client';
export class MessagingClient extends ApiSubClient {
  constructor(core: ApiCoreClient) {
    super(core);
    core.socket.on('message:chatMessageCreated', this.onChatMessageCreated);
    core.socket.on('message:getMoreChatMessages.response', this.onGetMoreChatMessage);
  }

  private onChatMessageCreated = (data: IncomingChatUpdatedMessage) => {
    client.cacheApi.addMessage(data.payload.widgetId, data.payload.message);
  };

  private onGetMoreChatMessage = (data: IncomingGetMoreChatMessage) => {
    client.cacheApi.updateChatHistory(data.payload.widgetId, data.payload.messages);
  };

  sendMessage = (payload: { widgetId: string; content: string }) => {
    this.core.socket.send({
      kind: 'createChatMessage',
      payload,
    });
  };

  getMoreMessages = (payload: { widgetId: string; lastMessageId: string }) => {
    this.core.socket.send({
      kind: 'getMoreChatMessages',
      payload,
    });
  };
}
