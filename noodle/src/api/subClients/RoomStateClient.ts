import { Analytics } from '@analytics/Analytics';
import { EventNames } from '@analytics/constants';
import { ApiCoreClient } from '@api/ApiCoreClient';
import { IncomingRoomStateUpdatedMessage } from '@api/roomState/types/socketProtocol';

import { ApiSubClient } from './ApiSubClient';

export class RoomStateClient extends ApiSubClient {
  constructor(core: ApiCoreClient) {
    super(core);
    core.socket.on('message:roomStateUpdated', this.onRoomStateUpdated);
  }

  private onRoomStateUpdated = (message: IncomingRoomStateUpdatedMessage) => {
    this.core.cacheApi.updateRoomState(message.payload);
  };

  bringToFront = (payload: { widgetId: string }) => {
    this.core.cacheApi.bringToFront(payload);
    this.core.socket.send({
      kind: 'updateRoomState',
      // TODO: partial updates for room state? Might already work?
      payload: this.core.roomStateStore.getState().state,
    });
  };

  setIsAudioGlobal = (isAudioGlobal: boolean) => {
    this.core.cacheApi.updateRoomState({ isAudioGlobal });
    this.core.socket.send({
      kind: 'updateRoomState',
      // retrieve the full state for sending to the socket
      payload: this.core.roomStateStore.getState().state,
    });
    Analytics.trackEvent(isAudioGlobal ? EventNames.ENABLED_GLOBAL_AUDIO : EventNames.DISABLED_GLOBAL_AUDIO, null, {
      roomId: this.core.roomStateStore.getState().id,
    });
  };

  setWallpaperRepeats = (wallpaperRepeats: boolean) => {
    this.core.cacheApi.updateRoomState({ wallpaperRepeats });
    this.core.socket.send({
      kind: 'updateRoomState',
      // retrieve the full state for sending to the socket
      payload: this.core.roomStateStore.getState().state,
    });
  };
}
