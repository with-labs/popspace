export interface DefaultConnectionParams {
  providerName: string;
}

/**
 * Responsible for fetching media tokens from the backend
 */
export interface MediaTokenProvider<
  ConnectionParams extends DefaultConnectionParams = DefaultConnectionParams,
> {
  getToken: (connectionParams: ConnectionParams) => Promise<string>;
}

export type TokenProviderConnectionParams<
  TokenProvider extends MediaTokenProvider,
> = TokenProvider extends MediaTokenProvider<infer ConnectionParams>
  ? ConnectionParams
  : never;
