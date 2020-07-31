class Api {
  constructor() {}

  async signup(data: any) {
    return await this.post('/request_create_account', data);
  }

  async completeSignup(otp: string, email: string) {
    return await this.post('/resolve_create_account', { otp: otp, email: email });
  }

  async requestLoginOtp(email: string) {
    return await this.post('/request_init_session', { email: email });
  }

  async logIn(otp: string, email: string) {
    return await this.post('/resolve_init_session', { otp: otp, email: email });
  }

  async getProfile(token: any) {
    return await this.post('/user_profile', { token: token });
  }

  async post(endpoint: string, data: any) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/.netlify/functions${endpoint}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = function() {
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
