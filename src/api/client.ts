import { RoomTemplate } from '@roomState/exportRoomTemplate';
import { ApiError } from '@src/errors/ApiError';
import { ErrorResponse, BaseResponse, ApiOpenGraphResult } from './types';

const SESSION_TOKEN_KEY = 'ndl_token';

export type Service = {
  url: string | null;
};

export class ApiClient {
  static SERVICES = {
    netlify: {
      url: '/.netlify/functions',
    },
    mercury: {
      url: process.env.REACT_APP_MERCURY_API_HOST || null,
    },
    api: {
      // this will eventually live on a separate URL
      url: process.env.REACT_APP_WITH_API_HOST || null,
    },
  };

  private _sessionToken: string | null = null;
  private _actor: any = null;

  get actor() {
    return this._actor;
  }

  constructor() {
    const storedSessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (storedSessionToken) {
      this._sessionToken = storedSessionToken;
    }
  }

  createActor = async () => {
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

  logout = () => {
    this._actor = null;
    this._sessionToken = null;
    localStorage.removeItem(SESSION_TOKEN_KEY);
  };

  createMeeting = (template: RoomTemplate) => {
    return this.post<{ newMeeting: any }>('/create_meeting', { template }, ApiClient.SERVICES.api);
  };

  joinMeeting = (roomName: string) => {
    return this.post<{ token: string }>('/logged_in_join_room', { roomName }, ApiClient.SERVICES.netlify);
  };

  async getRoomFileUploadUrl(fileName: string, contentType: string) {
    return await this.post<{ uploadUrl: string; downloadUrl: string }>(
      '/get_room_file_upload_url',
      {
        fileName,
        contentType,
      },
      ApiClient.SERVICES.netlify
    );
  }

  async deleteFile(fileUrl: string) {
    return await this.post('/delete_file', { fileUrl }, ApiClient.SERVICES.netlify);
  }

  async getOpenGraph(url: string) {
    return await this.post<{ result: ApiOpenGraphResult }>(
      '/opengraph',
      {
        url,
      },
      ApiClient.SERVICES.netlify
    );
  }

  async magicLinkUnsubscribe(otp: string, magicLinkId: string) {
    return await this.post('/magic_link_unsubscribe', { otp, magicLinkId }, ApiClient.SERVICES.api);
  }

  async magicLinkSubscribe(otp: string, magicLinkId: string) {
    return await this.post('/magic_link_subscribe', { otp, magicLinkId }, ApiClient.SERVICES.api);
  }

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

    const response = await fetch(`${service.url}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    const body = (await response.json()) as (BaseResponse & Response) | ErrorResponse;

    if (!body.success) {
      throw new ApiError(body);
    }

    return body;
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
