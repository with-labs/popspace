const RedisBase = require("./redis_base");

module.exports = class extends RedisBase {
  constructor() {
    super(`redis://${process.env.REDIS_ACCOUNTS_ENDPOINT}:${process.env.REDIS_ACCOUNTS_PORT}`);
  }

  async writeAccountCreateRequest(params, otp) {
    const expiry = 60 * 15 // 15 minutes
    params.otp = otp
    params.expireDuration = expiry * 1000
    params.requestedAt = Date.now()
    params.type = "acct_create"
    const value = JSON.stringify(params)
    return await this.hset("with_acct_request", params.email, value)
  }

  async getAccountCreateRequest(email) {
    let value = await this.hget("with_acct_request", email)
    if(!value) {
      value = await this.hget("with_resolved_acct_request", email)
    }
    if(!value) return null
    return JSON.parse(value)
  }

  async resolveAccountCreateRequest(request) {
    request.resolvedAt = Date.now()
    await this.hset("with_resolved_acct_request", request.email, JSON.stringify(request))
    return await this.hdel("with_acct_request", request.email)
  }

  async writeLogInRequest(email, otp) {
    const expiry = 60 * 15; // 15 minutes
    const params = {
      email: email,
      otp: otp,
      expireDuration: expiry * 1000,
      requestedAt: Date.now(),
      type: "log_in"
    }
    const value = JSON.stringify(params)
    return await this.hset("with_login_request", email, value)
  }

  async getLogInRequest(email) {
    let value = await this.hget("with_login_request", email)
    if(!value) {
      value = await this.hget("with_resolved_login_request", email)
    }
    if(!value) return null;
    return JSON.parse(value)
  }

  async resolveLogInRequest(request) {
    request.resolvedAt = Date.now()
    await this.hset("with_resolved_login_requests", request.email, JSON.stringify(request))
    return await this.hdel("with_login_request", request.email)
  }

}

