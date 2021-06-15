import { ErrorCodes } from '@constants/ErrorCodes';
import { RoomTemplate } from '@roomState/exportRoomTemplate';
import { ApiError } from '@src/errors/ApiError';
import i18n from '@src/i18n';
import { logger } from '@utils/logger';
import { ErrorResponse, BaseResponse, ApiOpenGraphResult, Actor } from './types';

const SESSION_TOKEN_KEY = 'ndl_token';

export type Service = {
  url: string | null;
};

export class ApiClient {
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

  private _sessionToken: string | null = null;
  private _actor: Actor | null = null;

  private _actorCreatePromise: Promise<Actor> | null = null;

  get actor() {
    return this._actor;
  }

  get sessionToken() {
    return this._sessionToken;
  }

  constructor() {
    const storedSessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (storedSessionToken) {
      this._sessionToken = storedSessionToken;
    }
  }

  private createActor = async () => {
    // bail early if we have one already
    if (this._actor) {
      return this._actor;
    }
    const { actor, sessionToken } = await this.post<{ actor: any; sessionToken: string }>(
      '/stub_user',
      {},
      ApiClient.SERVICES.api
    );

    this._actor = actor;
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
  private requireActor = <Handler extends (...args: any[]) => any>(handler: Handler) => {
    return async (...args: Parameters<Handler>) => {
      await this.ensureActor();
      return handler(...args);
    };
  };

  login = () => {
    return this.ensureActor();
  };

  logout = () => {
    this._actor = null;
    this._sessionToken = null;
    this._actorCreatePromise = null;
    localStorage.removeItem(SESSION_TOKEN_KEY);
  };

  createMeeting = this.requireActor((template: RoomTemplate) => {
    return this.post<{ newMeeting: any }>('/create_meeting', { template }, ApiClient.SERVICES.api);
  });

  joinMeeting = this.requireActor((roomRoute: string) => {
    return this.post<{ token: string }>('/logged_in_join_room', { roomRoute }, ApiClient.SERVICES.api);
  });

  getRoomFileUploadUrl = this.requireActor(async (fileName: string, contentType: string) => {
    return await this.post<{ uploadUrl: string; downloadUrl: string }>(
      '/get_room_file_upload_url',
      {
        fileName,
        contentType,
      },
      ApiClient.SERVICES.api
    );
  });

  deleteFile = this.requireActor(async (fileUrl: string) => {
    return await this.post('/delete_file', { fileUrl }, ApiClient.SERVICES.api);
  });

  getOpenGraph = this.requireActor(async (url: string) => {
    return await this.post<{ result: ApiOpenGraphResult }>(
      '/opengraph',
      {
        url,
      },
      ApiClient.SERVICES.api
    );
  });

  magicLinkUnsubscribe = (otp: string, magicLinkId: string) => {
    return this.post('/magic_link_unsubscribe', { otp, magicLinkId }, ApiClient.SERVICES.api);
  };

  magicLinkSubscribe = (otp: string, magicLinkId: string) => {
    return this.post('/magic_link_subscribe', { otp, magicLinkId }, ApiClient.SERVICES.api);
  };

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

export default new ApiClient();
