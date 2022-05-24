import { MediaService, MediaTokenProvider, DefaultConnectionParams } from '@withso/pop-media-sdk';
import { TwilioProvider } from '@withso/pop-media-twilio';
import { LiveKitProvider } from '@withso/pop-media-livekit';
import client from '@api/client';

// FIXME: we have to async request providers from the server
// because the values aren't known at build time... there must
// be a better way!
export const readyPromise = client.getMediaProviders().then((providers) => {
  if (providers.twilio) {
    // TODO: expose way to out-of-band add provider in media SDK
    (media as any).providers.twilio = new TwilioProvider();
  }
  if (providers.livekit) {
    (media as any).providers.livekit = new LiveKitProvider(providers.livekit.endpoint);
  }
  if (Object.keys(providers).length === 0) {
    throw new Error('No media providers configured');
  }
  return providers;
});

class TokenProvider implements MediaTokenProvider<DefaultConnectionParams & { roomRoute: string }> {
  getToken = async ({ roomRoute }: { roomRoute: string }) => {
    const token = await client.connectToMeeting(roomRoute);
    return token;
  };
}

export const media = new MediaService<TokenProvider>({
  providers: {},
  tokenProvider: new TokenProvider(),
});
