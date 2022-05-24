import { MediaService, MediaProvider, MediaTokenProvider, DefaultConnectionParams } from '@withso/pop-media-sdk';
import { TwilioProvider } from '@withso/pop-media-twilio';
import { LiveKitProvider } from '@withso/pop-media-livekit';
import client from '@api/client';

const providers: Record<string, MediaProvider> = {};

if (process.env.REACT_APP_USE_TWILIO) {
  providers.twilio = new TwilioProvider();
}
if (process.env.REACT_APP_USE_LIVEKIT) {
  if (!process.env.REACT_APP_LIVEKIT_ENDPOINT) {
    throw new Error('REACT_APP_LIVEKIT_ENDPOINT must be set if REACT_APP_USE_LIVEKIT is true');
  }
  providers.livekit = new LiveKitProvider(process.env.REACT_APP_LIVEKIT_ENDPOINT, {});
}

if (Object.keys(providers).length === 0) {
  throw new Error('No media providers configured');
}

class TokenProvider implements MediaTokenProvider<DefaultConnectionParams & { roomRoute: string }> {
  getToken = async ({ roomRoute }: { roomRoute: string }) => {
    const token = await client.connectToMeeting(roomRoute);
    return token;
  };
}

export const media = new MediaService<TokenProvider>({
  providers,
  tokenProvider: new TokenProvider(),
});
