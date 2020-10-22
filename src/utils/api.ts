import { ErrorCodes } from '../constants/ErrorCodes';

export type BaseResponse = {
  success: boolean;
  message?: string;
  errorCode?: ErrorCodes;
  [key: string]: any;
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
    return await this.post('/user_profile', { token });
  }

  async createRoom(token: any) {
    return await this.post('/create_room', { token });
  }

  async roomInvite(token: any, roomId: any, email: any) {
    return await this.post('/send_room_invite', { token, roomId, email });
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

  async unsubscribeFromEmail(opt: string, mlid: string) {
    // TODO: fill this out
    return true;
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
            resolve({ success: false, message: xhr.response } as any);
          }
        }
      };
      xhr.send(JSON.stringify(data));
    });
  }
}

export default new Api();
