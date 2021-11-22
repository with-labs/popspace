import { ApiSubClient } from './ApiSubClient';
import { EventNames } from '@src/analytics/constants';

export class EventsClient extends ApiSubClient {
  trackActorEvent = this.core.requireActor(
    async (data: { key: EventNames | string; value: any; meta?: { [key: string]: any } }) => {
      return this.core.post<{ key: EventNames | string; value: any; meta?: { [key: string]: any } }>(
        '/actor_event',
        data,
        this.core.SERVICES.api
      );
    }
  );
}
