import { ErrorCodes } from '../constants/ErrorCodes';
import { getSessionToken } from './sessionToken';
import { RoomInfo } from '../types/api';

export type BaseResponse = {
  success: boolean;
  message?: string;
  errorCode?: ErrorCodes;
  [key: string]: any;
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
};

export type ApiRoomMember = {
  display_name: string;
  email: string;
  user_id: string;
  avatar_url: string;
  has_accepted: boolean;
};

class Api {
  async signup(data: any) {
    return await this.post('/request_create_account', data);
  }

  async completeSignup(otp: string, email: string) {
    return await this.post('/resolve_create_account', { otp, email });
  }

  async requestLoginOtp(email: string) {
    return await this.post('/request_init_session', { email });
  }

  async logIn(otp: string, uid: string | null) {
    return await this.post('/resolve_init_session', { otp, uid });
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
    >('/user_profile', {});
  }

  async roomCreate(displayName: string) {
    return await this.post('/room_create', { displayName });
  }

  async roomRename(roomId: string, newDisplayName: string) {
    return await this.post('/room_rename', { roomId, newDisplayName });
  }

  async roomDelete(roomId: string) {
    return await this.post('/room_delete', { roomId });
  }

  async sendRoomInvite(roomName: string, email: string) {
    return await this.post<BaseResponse & { newMember: ApiRoomMember }>('/send_room_invite', { roomName, email });
  }

  async cancelRoomInvite(roomName: string, email: string) {
    return await this.post('/revoke_room_invites_and_membership', { roomName, email });
  }

  async removeRoomMember(roomName: string, email: string) {
    return await this.post('/revoke_room_invites_and_membership', { roomName, email });
  }

  async getRoomMembers(roomName: string) {
    return await this.post<BaseResponse & { result: ApiRoomMember[] }>('/room_get_members', { roomName });
  }

  async resolveRoomInvite(otp: string, inviteId: string | null) {
    return await this.post('/resolve_room_invite', { otp, inviteId });
  }

  async registerThroughInvite(data: any, otp: string, inviteId: string | null) {
    return await this.post('/register_through_invite', { data, otp, inviteId });
  }

  async registerThroughClaim(data: any, otp: string, claimId: string | null) {
    return await this.post('/register_through_claim', { data, otp, claimId });
  }

  async resolveRoomClaim(otp: string, claimId: string | null) {
    return await this.post('/resolve_room_claim', { otp, claimId });
  }

  async loggedInEnterRoom(roomName: string) {
    return await this.post<BaseResponse & { token?: string }>('/logged_in_join_room', { roomName });
  }

  async getToken(identity: string, password: string, roomName: string) {
    return await this.post<BaseResponse & { token?: string }>(`/token`, {
      user_identity: identity,
      room_name: roomName,
      passcode: password,
    });
  }

  async adminCreateAndSendClaimEmail(email: string, roomName: string) {
    return await this.post('/admin_create_and_send_claim_email', { email, roomName });
  }

  async adminRoomClaimsData() {
    return await this.post('/admin_room_claims_data', {});
  }

  async unsubscribeFromEmail(otp: string, mlid: string) {
    return await this.post('/unsubscribe', { otp, mlid });
  }

  async getRoomFileUploadUrl(fileName: string, contentType: string) {
    return await this.post<BaseResponse & { uploadUrl: string; downloadUrl: string }>('/get_room_file_upload_url', {
      fileName,
      contentType,
    });
  }

  async getOpenGraph(url: string) {
    return await this.post<BaseResponse & { result: ApiOpenGraphResult }>('/opengraph', {
      url,
    });
  }

  async roomMembershipThroughSharableLink(otp: string) {
    // todo: attach to backend
  }

  async post<Response extends BaseResponse>(endpoint: string, data: any): Promise<Response> {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/.netlify/functions${endpoint}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const token = getSessionToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${btoa(token)}`);
    }
    return new Promise<Response>((resolve, reject) => {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          try {
            const jsonResponse = JSON.parse(xhr.response);
            resolve(jsonResponse);
          } catch {
            resolve({ success: false, message: 'Unexpected error' } as any);
          }
        }
      };
      xhr.send(JSON.stringify(data));
    });
  }
}

export default new Api();

/** TODO: throw one of these one very failed request */
export class ApiError extends Error {
  code: string;

  get errorCode() {
    return this.code;
  }

  constructor(response: BaseResponse) {
    super(response.message || 'Unexpected error');
    this.code = response.errorCode?.toString() || ErrorCodes.UNEXPECTED;
  }
}
