class Api {
  constructor() {}

  async signup(data: any) {
    return await this.post('/request_create_account', data);
  }

  async post(endpoint: string, data: any) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/.netlify/functions${endpoint}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          console.log(xhr.response);
          resolve(JSON.parse(xhr.response));
        }
      };
      xhr.send(JSON.stringify(data));
    });
  }
}

export default new Api();
