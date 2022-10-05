import { ApiCoreClient } from '@api/ApiCoreClient';
import { RoomPositionState } from '@api/roomState/types/common';
import { IncomingParticipantMovedMessage, IncomingWidgetMovedMessage } from '@api/roomState/types/socketProtocol';
import { areTransformsEqual } from '@api/roomState/utils';
import { useOnboarding } from '@features/onboarding/useOnboarding';
import { ApiSubClient } from './ApiSubClient';

export class TransformClient extends ApiSubClient {
  constructor(core: ApiCoreClient) {
    super(core);
    core.socket.on('message:participantTransformed', this.onParticipantTransformed);
    core.socket.on('message:widgetTransformed', this.onWidgetTransformed);
  }

  private onParticipantTransformed = (message: IncomingParticipantMovedMessage) => {
    this.core.cacheApi.transformUser({
      userId: message.sender.actorId,
      transform: message.payload.transform,
    });
  };

  private onWidgetTransformed = (message: IncomingWidgetMovedMessage) => {
    this.core.cacheApi.transformWidget(message.payload);
  };

  // Public API

  transformWidget = async (payload: { widgetId: string; transform: Partial<RoomPositionState> }) => {
    const currentTransform = this.core.roomStateStore.getState().widgetPositions[payload.widgetId];
    const updatedTransform = {
      ...currentTransform,
      ...payload.transform,
    };
    this.core.cacheApi.transformWidget({ widgetId: payload.widgetId, transform: updatedTransform });
    await this.core.socket.sendAndWaitForResponse({
      kind: 'transformWidget',
      payload: {
        widgetId: payload.widgetId,
        transform: updatedTransform,
      },
    });
  };

  transformSelf = async (payload: Partial<RoomPositionState>) => {
    if (!this.core.actor) {
      throw new Error('Must authenticate before moving');
    }
    const userId = this.core.actor.actorId.toString();
    const currentTransform = this.core.roomStateStore.getState().userPositions[userId] || {};
    const updatedTransform = {
      ...currentTransform,
      ...payload,
    };
    // bail if transform has no effect
    if (!!currentTransform && areTransformsEqual(currentTransform, updatedTransform)) return;
    // optimistic update
    this.core.cacheApi.transformUser({ userId, transform: updatedTransform });
    // update onboarding
    useOnboarding.getState().api.markComplete('hasMoved');
    // send to peers
    await this.core.socket.sendAndWaitForResponse({
      kind: 'transformSelf',
      payload: {
        transform: updatedTransform,
      },
    });
  };
}
