import { ApiOpenGraphResult } from '@api/types';
import { ApiSubClient } from './ApiSubClient';

export class OpenGraphClient extends ApiSubClient {
  getOpenGraph = this.core.requireActor(async (url: string) => {
    return await this.core.post<{ result: ApiOpenGraphResult }>(
      '/opengraph',
      {
        url,
      },
      this.core.SERVICES.api
    );
  });
}
