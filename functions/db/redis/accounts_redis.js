const RedisBase = require("./redis_base");

const ENV_CREDENTIALS = {
  local: {
    host: process.env.REDIS_ACCOUNTS_HOST,
    port: process.env.REDIS_ACCOUNTS_PORT
  },
  production: {
    host: process.env.PRODUCTION_REDIS_ACCOUNTS_HOST,
    port: process.env.PRODUCTION_REDIS_ACCOUNTS_PORT,
    auth_pass: process.env.PRODUCTION_REDIS_ACCOUNTS_AUTH_PASS
  },
  staging: {
    host: process.env.STAGING_REDIS_ACCOUNTS_HOST,
    port: process.env.STAGING_REDIS_ACCOUNTS_PORT,
    auth_pass: process.env.STAGING_REDIS_ACCOUNTS_AUTH_PASS
  }
}

let CREDENTIALS = null
const getCredentias = () => {
  switch(process.env.NODE_ENV) {
    case "production":
      return ENV_CREDENTIALS.production
    case "development" || "local":
      return ENV_CREDENTIALS.local
    case "preview":
      return ENV_CREDENTIALS.staging
    case "staging":
      return ENV_CREDENTIALS.staging
    case "branch-deploy":
      return ENV_CREDENTIALS.staging
    default:
      throw `unrecognized environemt #{process.env.NODE_ENV}`
  }
}




module.exports = class extends RedisBase {
  constructor() {
    super(getCredentias());
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

