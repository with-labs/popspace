# API Client

This is a comprehensive SDK for working with all of our backend services and transports (HTTP and WebSocket), caching active state, and making mutations.

Operations covered by this client:

- Automatically provisioning an Actor on behalf of the local client
- Caching the authentication token for reuse in future sessions
- Connecting to the WebSocket using cached authentication
- Joining and leaving meetings, managing data sync connection
- Creating, deleting, and manipulating:
  - Yourself
  - Widgets
  - Files
  - Room details
- Keeping a cache of room state
- Enabling querying and subscribing to room state changes

Operations _not_ covered by this client:

- Connecting to A/V media sessions (not yet)

## Querying Client Data

You can access data about the current user or room session in a few ways:

### From React

Use the included hooks to query and access data:

#### `useRoomStore`

This hook lets you select data from the room session state cache and will automatically re-render your component when your selected data changes.

```ts
const widgetState = useRoomStore((room) => room.widgets[widgetId]?.widgetState);
```

#### `useLocalActor`

This hook keeps a synchronized copy of the local Actor if one exists. Use this to access the local client user's ID, display name, or avatar.

```ts
const { displayName } = useLocalActor();
```

#### `useLocalActorId`

Like `useLocalActor`, but specifically to ease retrieving the ID.

```ts
const localId = useLocalActorId();
```

#### `useIsMe`

A useful semantic hook to compare the local Actor ID (if any) with the ID of some user to determine if it is the local client user.

```ts
const isMyWidget = useIsMe(widget.ownerId);
```

## Extending the Client

To add more functionality to this client, follow the sub-client pattern.

1. Create a sub-class of `ApiSubClient` in the `subClients` directory.
2. Use the `this.core` property on the class to interact with HTTP and Socket APIs to implement your functionality.
3. If your functionality includes handling incoming socket messages, implement a constructor which listens for message events from `this.core.socket`.
4. Add your sub-client by key to the map passed to `createApiClient` in `./client.ts`.

See any of the existing sub-clients for inspiration.
