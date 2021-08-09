import { ApiCoreClient } from '@api/ApiCoreClient';
import { ApiSubClient } from './ApiSubClient';

export class MessagingClient extends ApiSubClient {
  constructor(core: ApiCoreClient) {
    super(core);
    core.socket.on('message:updateChatMessage', this.onUpdateChateMessage);
  }

  private onUpdateChateMessage = (data: any) => {};

  sendMessage = (payload: { widgetId: string; message: any }) => {
    this.core.socket.send({
      kind: 'sumbitChatMessage',
      payload,
    });
  };
}
