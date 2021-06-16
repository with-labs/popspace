import { ErrorCodes } from '@constants/ErrorCodes';
import { RoomTemplate } from '@api/roomState/exportRoomTemplate';
import { ApiError } from '@src/errors/ApiError';
import i18n from '@src/i18n';
import { logger } from '@utils/logger';
import { ErrorResponse, BaseResponse, Actor } from './types';
import { SocketConnection } from './roomState/SocketConnection';
import { IncomingAuthResponseMessage } from './roomState/types/socketProtocol';
import { createRoomStateStore, RoomStateStore } from './roomState/roomStateStore';
import { RoomStateCacheApi } from './roomState/RoomStateCacheApi';
import { EventEmitter } from 'events';

const SESSION_TOKEN_KEY = 'ndl_token';

export type Service = {
  url: string | null;
};

export interface ApiCoreClientEvents {
  actorChange: (actor: Actor | null) => void;
}

export declare interface ApiCoreClient {
  on<Event extends keyof ApiCoreClientEvents>(ev: Event, cb: ApiCoreClientEvents[Event]): this;
  off<Event extends keyof ApiCoreClientEvents>(ev: Event, cb: ApiCoreClientEvents[Event]): this;
  emit<Event extends keyof ApiCoreClientEvents>(ev: Event, ...args: Parameters<ApiCoreClientEvents[Event]>): boolean;
}

export class ApiCoreClient extends EventEmitter {
  static SERVICES = {
    netlify: {
      url: '/.netlify/functions',
    },
    hermes: {
      url: process.env.REACT_APP_HERMES_API_HOST || null,
    },
    api: {
      url: process.env.REACT_APP_NOODLE_API_HOST || null,
    },
  };
  // local copy is more useful in most cases. TODO: deprecate and remove static copy
  readonly SERVICES = ApiCoreClient.SERVICES;

  private _sessionToken: string | null = null;
  private _actor: Actor | null = null;

  private _actorCreatePromise: Promise<Actor> | null = null;

  readonly socket: SocketConnection;
  readonly roomStateStore: RoomStateStore;
  readonly cacheApi: RoomStateCacheApi;

  private socketReadyPromise: Promise<void>;

  get actor() {
    return this._actor;
  }

  get sessionToken() {
    return this._sessionToken;
  }

  get roomId() {
    return this.roomStateStore.getState().id;
  }

  constructor() {
    super();
    this.setMaxListeners(10000);
    const storedSessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (storedSessionToken) {
      this._sessionToken = storedSessionToken;
    }
    this.roomStateStore = createRoomStateStore();
    this.socket = new SocketConnection(process.env.REACT_APP_SOCKET_HOST!);
    this.socketReadyPromise = new Promise((resolve) => {
      this.socket.on('connected', resolve);
    });
    this.cacheApi = this.roomStateStore.getState().cacheApi;
  }

  // Internal Actor State Management

  private createActor = async () => {
    // bail early if we have one already
    if (this._actor) {
      return this._actor;
    }
    const { actor, sessionToken } = await this.post<{ actor: any; sessionToken: string }>(
      '/stub_user',
      {},
      ApiCoreClient.SERVICES.api
    );

    this._actor = actor;
    this.emit('actorChange', actor);

    this._sessionToken = sessionToken;

    localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);

    return actor;
  };

  /**
   * Ensures an actor is assigned to this client in a synchronized way,
   * so that even if called multiple times in async only one actor is created.
   *
   * It does this by synchronously assigning a Promise class variable with
   * an actor creation promise if such a promise is not already extant,
   * otherwise it just returns that created promise.
   */
  private ensureActor = () => {
    // if an actor exists, we're done.
    if (this.actor) {
      return Promise.resolve(this.actor);
    }
    if (!this._actorCreatePromise) {
      // create and assign the promise, then clear it after it is finished.
      this._actorCreatePromise = this.createActor().finally(() => {
        this._actorCreatePromise = null;
      });
    }
    return this._actorCreatePromise;
  };

  /** Request method wrapper for mandating an actor before making a request. */
  requireActor = <Handler extends (...args: any[]) => any>(handler: Handler) => {
    return async (...args: Parameters<Handler>) => {
      await this.ensureActor();
      return handler(...args);
    };
  };

  // Authentication

  login = () => {
    return this.ensureActor();
  };

  logout = () => {
    this._actor = null;
    this.emit('actorChange', null);
    this._sessionToken = null;
    this._actorCreatePromise = null;
    localStorage.removeItem(SESSION_TOKEN_KEY);
  };

  // Core Meeting Functionality

  createMeeting = this.requireActor((template: RoomTemplate) => {
    return this.post<{ newMeeting: any }>('/create_meeting', { template }, ApiCoreClient.SERVICES.api);
  });

  /**
   * Connects to a meeting room, provisions a Twilio token, joins the socket channel... the whole
   * 9 yards.
   * @returns the Twilio media token to join AV session
   */
  joinMeeting = this.requireActor(async (roomRoute: string) => {
    // retrieve a media token in parallel - don't await yet
    const mediaResponse = this.post<{ token: string }>(
      '/logged_in_join_room',
      { roomRoute },
      ApiCoreClient.SERVICES.api
    );

    // wait for the socket to be connected ... this could be smoother
    await this.socketReadyPromise;

    // authenticate and join the room via websocket
    const authResponse = await this.socket.sendAndWaitForResponse<IncomingAuthResponseMessage>(
      {
        kind: 'auth',
        payload: {
          roomRoute,
          // requireActor ensures this
          token: this.sessionToken!,
        },
      },
      // 10 second timeout; it can be a large payload
      10 * 1000
    );
    // initialize the state store
    this.cacheApi.reset();
    this.cacheApi.initialize(authResponse);

    const { token } = await mediaResponse;
    return token;
  });

  leaveMeeting = () => {
    this.cacheApi.reset();
    // TODO: socket leave event
  };

  // Generic HTTP methods

  /* TODO: service should be mandatory/explicit; update all uses and remove the default value */
  async post<Response = {}>(endpoint: string, data: any = {}, service: Service) {
    return this.request<Response>({
      method: 'POST',
      endpoint,
      data: data,
      service,
    });
  }

  /* TODO: service should be mandatory/explicit; update all uses and remove the default value */
  async get<Response = {}>(endpoint: string, service: Service) {
    return this.request<Response>({
      method: 'GET',
      endpoint,
      service,
    });
  }

  /**
   * Makes an API request and throws an ApiError if it fails
   */
  private async request<Response>(opts: { method: string; endpoint: string; data?: any; service: Service }) {
    const { service, method, endpoint, data } = opts;

    // timeout requests after 15s
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 15_000);

    try {
      const response = await fetch(`${service.url}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: abortController.signal,
      });
      clearTimeout(timeout);

      const body = (await response.json()) as (BaseResponse & Response) | ErrorResponse;

      if (!body.success) {
        throw new ApiError(body);
      }

      return body;
    } catch (err) {
      logger.error(err);
      throw new ApiError({
        errorCode: ErrorCodes.UNEXPECTED,
        message: i18n.t('error.api.UNEXPECTED.message'),
        success: false,
      });
    }
  }

  private getAuthHeaders(): { Authorization: string } | {} {
    return this._sessionToken
      ? {
          Authorization: `Bearer ${btoa(this._sessionToken)}`,
        }
      : {};
  }
}
