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
      this.client.hset("with_acct_request", params.email, value, this.onComplete(resolve, reject));
      this.client.expire("with_acct_request", expiry)
    });
  }

  async getAccountCreateRequest(email) {
    let value = await this.hget("with_acct_request", email);
    if(!value) {
      value = await this.hget("with_resolved_acct_requests", email);
    }
    if(!value) return null;
    return JSON.parse(value);
  }

  async resolveAccountCreateRequest(request) {
    request.resolvedAt = Date.now()
    await this.hset("with_resolved_acct_requests", request.email, JSON.stringify(request))
    return await this.hdel("with_acct_request", request.email)
  }

  async storeSession(sessionId, userId, expireInMillis=null) {
    let expireAtTimestamp = null;
    if(expireInMillis) {
      expireAtTimestamp = Date.now() + expireInMillis;
    }
    const session = {
      expireAtTimestamp: expireAtTimestamp,
      createdAt: Date.now()
      // We don't need to store the userId/sessionId,
      // Since we have them as keys
    }
    const redisKey = `with:sss:${userId}`
    const hKey = sessionId
    await this.hset(redisKey, hKey, JSON.stringify(session))
  }
}

