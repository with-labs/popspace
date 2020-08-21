/**
This is not currently in use, but it's useful reference for future.

While we're on Netlify, there is no great option to use redis.

If/when we migrate into AWS, we'll at least want to store sessions in redis,
maybe account create data as well (but less importantly).

They key adavntage we'd get with redis is the O(1) access to sessions -
which is beneficial since it's high throughput: every request need to do a
session key check. It's great to take a non-stop stream of requests off
the main database, and not have to degrade our load times as more users sign up.
*/

const RedisBase = require("./redis_base");

const ENV_CREDENTIALS = {
  local: {
    host: process.env.REDIS_ACCOUNTS_HOST,
    port: process.env.REDIS_ACCOUNTS_PORT,
    auth_pass: process.env.REDIS_ACCOUNTS_PASS,
    password: process.env.REDIS_ACCOUNTS_PASS,
    pass: process.env.REDIS_ACCOUNTS_PASS,
    tls: { checkServerIdentity: () => undefined }
  },
  production: {
    host: process.env.PRODUCTION_REDIS_ACCOUNTS_HOST,
    port: process.env.PRODUCTION_REDIS_ACCOUNTS_PORT,
    auth_pass: process.env.PRODUCTION_REDIS_ACCOUNTS_AUTH_PASS,
    tls: { checkServerIdentity: () => undefined }
  },
  staging: {
    host: process.env.STAGING_REDIS_ACCOUNTS_HOST,
    port: process.env.STAGING_REDIS_ACCOUNTS_PORT,
    auth_pass: process.env.STAGING_REDIS_ACCOUNTS_AUTH_PASS,
    tls: { checkServerIdentity: () => undefined }
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
    case 'test':
      return ENV_CREDENTIALS.staging
    default:
      throw `unrecognized environemt ${process.env.NODE_ENV} Env: ${JSON.stringify(process.env)}`
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

