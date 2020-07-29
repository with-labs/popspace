const RedisBase = require("./redis_base");

module.exports = class extends RedisBase {
  constructor() {
    super(`redis://${process.env.REDIS_ACCOUNTS_ENDPOINT}:${process.env.REDIS_ACCOUNTS_PORT}`);
  }

  async writeAccountCreateRequest(params, otp) {
    const expiry = 60 * 15; // 15 minutes
    params.otp = otp;
    params.expireTimestamp = Date.now() + expiry * 1000;
    const value = JSON.stringify(params);
    return new Promise((resolve, reject) => {
      this.client.hset("with_acct_request", params.email, value, 'EX', expiry, this.onComplete(resolve, reject));
    });
  }

  async getAccountCreateRequest(email) {
    const value = await this.client.hget("with_acct_request", email);
    if(!value) return null;
    return JSON.parse(value);
  }
}

