import { ErrorCodes } from '../constants/ErrorCodes';

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

  async sendRoomInvite(token: any, roomName: any, email: any) {
    return await this.post('/send_room_invite', { token, roomName, email });
  }

  async cancelRoomInvite(token: any, roomName: any, email: any) {
    // TODO fill this out
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

  async getRoomMembers(token: any, roomName: string) {
    //TODO: fill this out
    return {
      result: [
        { display_name: 'test name 1', email: 'test1@test.com', user_id: 1, avatar_url: '', has_accepted: true },
        { display_name: 'test name 2', email: 'test2@test.com', user_id: 2, avatar_url: '', has_accepted: true },
        { display_name: 'test name 3', email: 'test3@test.com', user_id: 3, avatar_url: '', has_accepted: true },
        { display_name: '', email: 'test4@test.com', user_id: 4, avatar_url: '', has_accepted: false },
        { display_name: '', email: 'test5@test.com', user_id: 5, avatar_url: '', has_accepted: false },
        { display_name: '', email: 'test6@test.com', user_id: 6, avatar_url: '', has_accepted: false },
      ],
    };
  }

  async removeRoomMember(token: any, memberId: string) {
    //TODO: fill this out
  }

  async post<Response extends BaseResponse>(endpoint: string, data: any): Promise<Response> {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/.netlify/functions${endpoint}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
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
