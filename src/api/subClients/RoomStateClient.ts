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

  setWallpaperUrl = (wallpaperUrl: string, isCustomWallpaper = false) => {
    this.core.cacheApi.updateRoomState({
      wallpaperUrl,
      isCustomWallpaper,
    });
    this.core.socket.send({
      kind: 'updateRoomState',
      // retrieve the full state for sending to the socket
      payload: this.core.roomStateStore.getState().state,
    });
    Analytics.trackEvent(EventNames.CHANGED_WALLPAPER, null, {
      roomId: this.core.roomStateStore.getState().id,
      isCustomWallpaper,
    });
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
}
