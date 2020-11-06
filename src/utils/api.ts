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

  async getProfile(token: any) {
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
    >('/user_profile', { token });
  }

  async createRoom(token: any) {
    return await this.post('/create_room', { token });
  }

  async sendRoomInvite(token: any, roomName: string, email: string) {
    return await this.post('/send_room_invite', { token, roomName, email });
  }

  async cancelRoomInvite(token: any, roomName: string, email: string) {
    return await this.post('/revoke_room_invites_and_membership', { token, roomName, email });
  }

  async removeRoomMember(token: any, roomName: string, email: string) {
    return await this.post('/revoke_room_invites_and_membership', { token, roomName, email });
  }

  async getRoomMembers(token: any, roomName: string) {
    return await this.post('/room_get_members', { token, roomName });
  }

  async resolveRoomInvite(token: any, otp: string, inviteId: string) {
    return await this.post('/resolve_room_invite', { token, otp, inviteId });
  }

  async registerThroughInvite(token: any, data: any, otp: string, inviteId: string) {
    return await this.post('/register_through_invite', { token, data, otp, inviteId });
  }

  async registerThroughClaim(token: any, data: any, otp: string, claimId: string) {
    return await this.post('/register_through_claim', { token, data, otp, claimId });
  }

  async resolveRoomClaim(token: any, otp: string, claimId: string) {
    return await this.post('/resolve_room_claim', { token, otp, claimId });
  }

  async loggedInEnterRoom(token: any, roomName: string) {
    return await this.post<BaseResponse & { token?: string }>('/logged_in_join_room', { token, roomName });
  }

  async getToken(identity: string, password: string, roomName: string) {
    return await this.post<BaseResponse & { token?: string }>(`/token`, {
      user_identity: identity,
      room_name: roomName,
      passcode: password,
    });
  }

  async adminCreateAndSendClaimEmail(token: any, email: string, roomName: string) {
    return await this.post('/admin_create_and_send_claim_email', { token, email, roomName });
  }

  async adminRoomClaimsData(token: any) {
    return await this.post('/admin_room_claims_data', { token });
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

  async uploadRoomContentFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    const sessionToken = getSessionToken();
    if (!sessionToken) {
      throw new Error('Authentication required');
    }

    try {
      const result = await fetch(`/.netlify/functions/upload_room_content_file`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${btoa(sessionToken)}`,
        },
      });

      if (result.ok) {
        const body = await result.json();
        return body;
      } else {
        const body = await result.text();
        console.error(`File upload failed`, result, body);
        return { success: false, message: 'Unexpected error' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Unexpected error' };
    }
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
