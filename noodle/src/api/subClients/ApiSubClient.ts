import { ApiCoreClient } from '@api/ApiCoreClient';

export abstract class ApiSubClient {
  constructor(protected core: ApiCoreClient) {}

  /** Extend this class and add methods! */
}
