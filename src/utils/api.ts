import { ErrorCodes } from '@constants/ErrorCodes';
import { getSessionToken } from './sessionToken';
import { RoomInfo } from '../types/api';

/** TODO: throw one of these on every failed request */
// import { ApiError } from '../errors/ApiError';

export type BaseResponse = {
  success: boolean;
  message?: string;
  errorCode?: ErrorCodes;
  [key: string]: any;
};

export type InviteDetails = {
  otp: string;
  inviteId: string;
};

export type ApiUser = {
  admin: boolean;
  avatar_url: string | null;
  created_at: string;
  deleted_at: string;
  display_name: string;
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  newsletter_opt_in: boolean;
};

export type ApiOpenGraphResult = {
  title: string | null;
  iframeUrl: string | null;
  iconUrl: string | null;
};

export type ApiRoomMember = {
  displayName: string;
  email: string;
  userId: string;
  avatarName: string;
  hasAccepted: boolean;
};

export type ApiInviteDetails = {
  success: boolean;
  inviteDetails?: InviteDetails[];
};

export type ApiNamedRoom = {
  room_id: string;
  owner_id: string;
  preview_image_url: string;
  display_name: string;
  route: string;
  url_id: string;
};

export type Service = {
  url: string | null;
};

export type ApiParticipantState = {
  avatar_name: string;
  display_name: string;
};

export const SERVICES = {
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

class Api {
  async signup(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    receiveMarketing?: boolean;
    inviteOtp?: string;
    inviteId?: string;
    ref?: string | null;
  }) {
    return await this.post<BaseResponse>('/request_create_account', data, SERVICES.netlify);
  }

  async completeSignup(otp: string, email: string) {
    return await this.post('/resolve_create_account', { otp, email }, SERVICES.netlify);
  }

  async requestLoginOtp(data: { email: string; inviteCode?: string; inviteId?: string }) {
    return await this.post('/request_init_session', data, SERVICES.netlify);
  }

  async logIn(otp: string, uid: string | null) {
    return await this.post('/resolve_init_session', { otp, uid }, SERVICES.netlify);
  }

  async getProfile() {
    return await this.post<
      BaseResponse & {
        profile?: {
          user: ApiUser;
          rooms: {
            owned: RoomInfo[];
            member: RoomInfo[];
          };
        };
      }
    >('/user_profile', {}, SERVICES.netlify);
  }

  async roomCreate(displayName: string) {
    return await this.post<{ newRoom: ApiNamedRoom }>('/room_create', { displayName }, SERVICES.netlify);
  }

  async roomRename(roomId: string, newDisplayName: string) {
    return await this.post<{ route: string; url_id: string; display_name: string }>(
      '/room_rename',
      {
        roomId,
        newDisplayName,
      },
      SERVICES.netlify
    );
  }

  async roomDelete(roomId: string) {
    return await this.post<{ deletedRoomId: number }>('/room_delete', { roomId }, SERVICES.netlify);
  }

  async sendRoomInvite(roomRoute: string, email: string) {
    return await this.post<{ newMember: ApiRoomMember }>('/send_room_invite', { roomRoute, email }, SERVICES.netlify);
  }

  async cancelRoomInvite(roomName: string, email: string) {
    return await this.post('/revoke_room_invites_and_membership', { roomName, email }, SERVICES.netlify);
  }

  async removeRoomMember(roomName: string, email: string) {
    return await this.post('/revoke_room_invites_and_membership', { roomName, email }, SERVICES.netlify);
  }

  async getRoomMembers(roomName: string) {
    return await this.post<{ result: ApiRoomMember[] }>('/room_get_members', { roomName }, SERVICES.netlify);
  }

  async resolveRoomInvite(otp: string, inviteId: string | null) {
    return await this.post('/resolve_room_invite', { otp, inviteId }, SERVICES.netlify);
  }

  async registerThroughInvite(data: any, otp: string, inviteId: string | null) {
    return await this.post('/register_through_invite', { data, otp, inviteId }, SERVICES.netlify);
  }

  async registerThroughClaim(data: any, otp: string, claimId: string | null) {
    return await this.post('/register_through_claim', { data, otp, claimId }, SERVICES.netlify);
  }

  async resolveRoomClaim(otp: string, claimId: string | null) {
    return await this.post('/resolve_room_claim', { otp, claimId }, SERVICES.netlify);
  }

  async loggedInEnterRoom(roomName: string) {
    return await this.post<{ token?: string }>('/logged_in_join_room', { roomName }, SERVICES.netlify);
  }

  async getToken(identity: string, password: string, roomName: string) {
    return await this.post<{ token?: string }>(
      `/token`,
      {
        user_identity: identity,
        room_name: roomName,
        passcode: password,
      },
      SERVICES.netlify
    );
  }

  async adminCreateAndSendClaimEmail(email: string, roomName: string) {
    return await this.post('/admin_create_and_send_claim_email', { email, roomName }, SERVICES.netlify);
  }

  async adminRoomClaimsData() {
    return await this.post('/admin_room_claims_data', {}, SERVICES.netlify);
  }

  async getRoomFileUploadUrl(fileName: string, contentType: string) {
    return await this.post<{ uploadUrl: string; downloadUrl: string }>(
      '/get_room_file_upload_url',
      {
        fileName,
        contentType,
      },
      SERVICES.netlify
    );
  }

  async deleteFile(fileUrl: string) {
    return await this.post('/delete_file', { fileUrl }, SERVICES.netlify);
  }

  async getOpenGraph(url: string) {
    return await this.post<{ result: ApiOpenGraphResult }>(
      '/opengraph',
      {
        url,
      },
      SERVICES.netlify
    );
  }

  async roomMembershipThroughPublicInviteLink(otp: string, inviteId: string) {
    return await this.post('/room_membership_through_public_invite_link', { otp, inviteId }, SERVICES.mercury);
  }

  async enablePublicInviteLink(roomRoute: string) {
    return await this.post('/enable_public_invite_link', { roomRoute }, SERVICES.mercury);
  }

  async disablePublicInviteLink(roomRoute: string) {
    return await this.post('/disable_public_invite_link', { roomRoute }, SERVICES.mercury);
  }

  async getCurrentPublicInviteLink(roomRoute: string) {
    return await this.post('/get_public_invite_details', { roomRoute }, SERVICES.mercury);
  }

  async resetPublicInviteLink(roomRoute: string) {
    return await this.post('/reset_public_invite_link', { roomRoute }, SERVICES.mercury);
  }

  async subscribeToNewsletter(userId: string) {
    return await this.post('/subscribe_to_newsletter', { userId }, SERVICES.api);
  }

  async unsubscribeFromEmail(otp: string, mlid: string) {
    /* DEPRECATED, prefer magicLinkUnsubscribe*/
    return await this.post('/unsubscribe', { otp, mlid }, SERVICES.netlify);
  }

  async magicLinkUnsubscribe(otp: string, magicLinkId: string) {
    return await this.post('/magic_link_unsubscribe', { otp, magicLinkId }, SERVICES.api);
  }

  async magicLinkSubscribe(otp: string, magicLinkId: string) {
    return await this.post('/magic_link_subscribe', { otp, magicLinkId }, SERVICES.api);
  }

  async setDefaultRoom(roomRoute: string) {
    return await this.post<BaseResponse>('/set_default_room', { roomRoute }, SERVICES.mercury);
  }

  async getDefaultRoom() {
    return this.post<BaseResponse & { room_route: string }>('/get_or_init_default_room', SERVICES.mercury);
  }

  async setParticipantState(participantState: ApiParticipantState) {
    return this.post<BaseResponse & { participantState: ApiParticipantState }>(
      '/update_participant_state',
      { participantState },
      SERVICES.api
    );
  }

  async removeSelfFromRoom(roomRoute: string) {
    return await this.post<BaseResponse>('/remove_self_from_room', { roomRoute }, SERVICES.api);
  }

  /* TODO: service should be mandatory/explicit; update all uses and remove the default value */
  async post<Response = {}>(endpoint: string, data: any = {}, service: Service = SERVICES.netlify) {
    return this.request<Response>({
      method: 'POST',
      endpoint,
      data: data,
      service,
    });
  }

  /* TODO: service should be mandatory/explicit; update all uses and remove the default value */
  async get<Response = {}>(endpoint: string, service: Service = SERVICES.netlify) {
    return this.request<Response>({
      method: 'GET',
      endpoint,
      service,
    });
  }

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

    return response.json() as Promise<BaseResponse & Response>;
  }

  private getAuthHeaders(): { Authorization: string } | {} {
    const token = getSessionToken();
    return token
      ? {
          Authorization: `Bearer ${btoa(token)}`,
        }
      : {};
  }
}

export default new Api();
