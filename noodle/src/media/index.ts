import { MediaService, MediaProvider, MediaTokenProvider } from '@withso/pop-media-sdk';
import { TwilioProvider } from '@withso/pop-media-twilio';
import client from '@api/client';

const providers: Record<string, MediaProvider> = {};

if (process.env.REACT_PUBLIC_USE_TWILIO) {
  providers.twilio = new TwilioProvider();
}

if (Object.keys(providers).length === 0) {
  throw new Error('No media providers configured');
}

class TokenProvider implements MediaTokenProvider<{ providerName: string; roomRoute: string }> {
  getToken = async ({ providerName, roomRoute }: { providerName: string; roomRoute: string }) => {
    const token = await client.connectToMeeting(roomRoute);
    return token;
  };
}

export const media = new MediaService<TokenProvider>({
  providers,
  tokenProvider: new TokenProvider(),
});
