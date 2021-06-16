import { ApiSubClient } from './ApiSubClient';

export class MagicLinkClient extends ApiSubClient {
  magicLinkUnsubscribe = (otp: string, magicLinkId: string) => {
    return this.core.post('/magic_link_unsubscribe', { otp, magicLinkId }, this.core.SERVICES.api);
  };

  magicLinkSubscribe = (otp: string, magicLinkId: string) => {
    return this.core.post('/magic_link_subscribe', { otp, magicLinkId }, this.core.SERVICES.api);
  };
}
