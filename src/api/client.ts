import { ApiCoreClient } from '@api/ApiCoreClient';
import { ApiSubClient } from '@api/subClients/ApiSubClient';
import { FileClient } from '@api/subClients/FileClient';
import { MagicLinkClient } from '@api/subClients/MagicLinkClient';
import { OpenGraphClient } from '@api/subClients/OpenGraphClient';
import { ParticipantClient } from '@api/subClients/ParticipantClient';
import { PassthroughClient } from '@api/subClients/PassthroughClient';
import { RoomStateClient } from '@api/subClients/RoomStateClient';
import { TransformClient } from '@api/subClients/TransformClient';
import { WidgetClient } from '@api/subClients/WidgetClient';

type SubClientImplementation = {
  new (core: ApiCoreClient): ApiSubClient;
};

type SubClientMapInstances<SubClients extends Record<string, SubClientImplementation>> = {
  [K in keyof SubClients]: InstanceType<SubClients[K]>;
};

/**
 * Constructs a unified API client instance by creating an ApiCoreClient, and then
 * constructing and attaching all provided ApiSubClients at their specified name keys.
 *
 * The resulting client extends the Core API with named sub-clients that provide more
 * detailed app functionality.
 *
 * @example
 * const client = createApiClient({ roomState: RoomStateClient });
 * // core methods are available
 * client.joinMeeting('some-meeting');
 * // sub-clients are available
 * client.roomState.setWallpaperUrl('https://wp.com/img.jpg');
 */
function createApiClient<SubClients extends Record<string, SubClientImplementation>>(subClients: SubClients) {
  const core = new ApiCoreClient();
  // constructs an instance of each subclient and attaches it to the core instance
  const client = Object.entries(subClients).reduce((clientDraft, [key, SubClient]) => {
    clientDraft[key] = new SubClient(core);
    return clientDraft;
  }, core as ApiCoreClient & Record<string, ApiSubClient>);
  return client as ApiCoreClient & SubClientMapInstances<SubClients>;
}

const client = createApiClient({
  roomState: RoomStateClient,
  widgets: WidgetClient,
  participants: ParticipantClient,
  passthrough: PassthroughClient,
  transforms: TransformClient,
  files: FileClient,
  openGraph: OpenGraphClient,
  magicLinks: MagicLinkClient,
});

export default client;

// debugging
// @ts-ignore
window.client = client;
