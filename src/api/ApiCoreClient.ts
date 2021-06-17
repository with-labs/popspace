import { ErrorCodes } from '@constants/ErrorCodes';
import { RoomTemplate } from '@api/roomState/exportRoomTemplate';
import { ApiError } from '@src/errors/ApiError';
import i18n from '@src/i18n';
import { logger } from '@utils/logger';
import { ErrorResponse, BaseResponse, Actor } from './types';
import { SocketConnection } from './roomState/SocketConnection';
import { IncomingAuthResponseMessage } from './roomState/types/socketProtocol';
import { roomStateStore, RoomStateStore } from './roomState/roomStateStore';
import { RoomStateCacheApi } from './roomState/RoomStateCacheApi';
import { EventEmitter } from 'events';
import { ParticipantState } from '@constants/twilio';

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
  readonly SERVICES = {
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

  private set actor(val: Actor | null) {
    this._actor = val;
    this.emit('actorChange', val);
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
    this.roomStateStore = roomStateStore;
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
      this.SERVICES.api
    );

    this.actor = actor;

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
  private ensureActor = async () => {
    // if an actor exists, we're done.
    if (this.actor) {
      return this.actor;
    }
    if (this._sessionToken) {
      // we have an active session, try to restore actor
      try {
        const actorResponse = await this.get<{ actor: Actor }>('/actor', this.SERVICES.api);
        this.actor = actorResponse.actor;
        return this.actor;
      } catch (err) {
        // keep going, create a new session.
      }
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
  requireActor = <Args extends any[], Ret extends any>(handler: (...args: Args) => Ret): AsyncMiddleware<Args, Ret> => {
    return async (...args: Args): Promise<Ret> => {
      await this.ensureActor();
      return handler(...args);
    };
  };

  // Authentication

  login = () => {
    return this.ensureActor();
  };

  logout = () => {
    this.actor = null;
    this._sessionToken = null;
    this._actorCreatePromise = null;
    localStorage.removeItem(SESSION_TOKEN_KEY);
  };

  // Core Meeting Functionality

  createMeeting = this.requireActor((template: RoomTemplate) => {
    return this.post<{ newMeeting: any }>('/create_meeting', { template }, this.SERVICES.api);
  });

  /**
   * Connects to a meeting room, provisions a Twilio token, joins the socket channel... the whole
   * 9 yards.
   * @returns the Twilio media token to join AV session
   */
  joinMeeting = this.requireActor(async (roomRoute: string) => {
    // retrieve a media token in parallel - don't await yet
    const mediaResponse = this.post<{ token: string }>('/logged_in_join_room', { roomRoute }, this.SERVICES.api);

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

  async post<Response = {}>(endpoint: string, data: any = {}, service: Service) {
    return this.request<Response>({
      method: 'POST',
      endpoint,
      data: data,
      service,
    });
  }

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

type AsyncMiddleware<Args extends any[], Ret extends any> = (...args: Args) => Promise<Ret>;
