class Api {
  constructor() {}

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
  async post(endpoint: string, data: any) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/.netlify/functions${endpoint}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          try {
            const jsonResponse = JSON.parse(xhr.response);
            resolve(jsonResponse);
          } catch {
            resolve({ success: false, message: xhr.response });
          }
        }
      };
      xhr.send(JSON.stringify(data));
    });
  }
}

export default new Api();
