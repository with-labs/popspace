import { ApiSubClient } from './ApiSubClient';
import { EventNames } from '@src/analytics/constants';

export class EventsClient extends ApiSubClient {
  async trackActorEvent(data: { key: EventNames; value: any; meta?: { [key: string]: any } }) {
    return this.core.post<{ key: EventNames; value: any; meta?: { [key: string]: any } }>(
      '/actor_event',
      data,
      this.core.SERVICES.api
    );
  }
}
