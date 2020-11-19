import { ErrorCodes } from '../constants/ErrorCodes';
import { getSessionToken } from './getSessionToken';

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

export type ApiRoom = {
  id: string;
  name: string;
  owner_id: string;
  priority_level: number;
};

export type ApiOpenGraphResult = {
  url: string;
  title?: string;
  image?: string;
  description?: string;
  type: string;
  site_name?: string;
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

  async logIn(otp: string, uid: string) {
    return await this.post('/resolve_init_session', { otp, uid });
  }

  async getProfile() {
    return await this.post<
      BaseResponse & {
        profile?: {
          user: ApiUser;
          rooms: {
            owned: ApiRoom[];
            member: ApiRoom[];
          };
        };
      }
    >('/user_profile', {});
  }

  async createRoom() {
    return await this.post('/create_room', {});
  }

  async sendRoomInvite(roomName: string, email: string) {
    return await this.post('/send_room_invite', { roomName, email });
  }

  async cancelRoomInvite(roomName: string, email: string) {
    return await this.post('/revoke_room_invites_and_membership', { roomName, email });
  }

  async removeRoomMember(roomName: string, email: string) {
    return await this.post('/revoke_room_invites_and_membership', { roomName, email });
  }

  async getRoomMembers(roomName: string) {
    return await this.post('/room_get_members', { roomName });
  }

  async resolveRoomInvite(otp: string, inviteId: string) {
    return await this.post('/resolve_room_invite', { otp, inviteId });
  }

  async registerThroughInvite(data: any, otp: string, inviteId: string) {
    return await this.post('/register_through_invite', { data, otp, inviteId });
  }

  async registerThroughClaim(data: any, otp: string, claimId: string) {
    return await this.post('/register_through_claim', { data, otp, claimId });
  }

  async resolveRoomClaim(otp: string, claimId: string) {
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
