const pg = require("./pg/pg")
const cryptoRandomString = require('crypto-random-string');
const moment = require("moment")

const STANDARD_REQUEST_DURATION_MILLIS = 10 * 60 * 1000
const ERROR_CODES = {
  UNEXPECTER_ERROR: -1,
  // Don't use 0 since it's false-y and is fertile grounds for programming error
  INVALID_OTP: 1,
  EXPIRED_OTP: 2,
  RESOLVED_OTP: 3
}

const secureString = () => {
  return cryptoRandomString({length: 64, type: 'url-safe'})
}

const now = () => {
  return moment.utc().format()
}

const standardExpiration = () => {
  return moment(moment.utc().valueOf() + STANDARD_REQUEST_DURATION_MILLIS).utc().format()
}

class Accounts {
  constructor() {

  }

  getSignupUrl(appUrl, accountCreateRequest) {
    return `${appUrl}/complete_signup?otp=${accountCreateRequest.otp}&email=${accountCreateRequest.email}`
  }

  getLoginUrl(appUrl, loginRequest) {
    return `${appUrl}/login?otp=${loginRequest.otp}&uid=${loginRequest.user_id}`
  }

  async init() {
    this.pg = await pg.init()
  }

  async cleanup() {
    await pg.tearDown()
    this.pg = null
  }

  async getLatestAccountCreateRequest(email) {
    const requests = await this.pg.otp_account_create_requests.find({
      email: email
    }, {
      order: [{
        field: "created_at",
        direction: "desc"
      }],
      limit: 1
    })
    return requests[0]
  }

  isExpired(entity) {
    if(!entity.expires_at) return false;
    return moment(entity.expires_at).valueOf() < moment.utc().valueOf()
  }

  async userByEmail(email) {
    return this.pg.users.findOne({email: email})
  }

  async userById(id) {
    return this.pg.users.findOne({id: id})
  }

  /*
    requestParams = {
      email: string,
      first_name: string,
      last_name: string,
      display_name: string,
      newsletter_opt_in: boolean
    }
  */
  async createAccountRequest(requestParams) {
    const request = Object.assign({}, requestParams)
    request.otp = secureString()
    request.requested_at = now()
    request.expires_at = standardExpiration()

    return await this.pg.otp_account_create_requests.insert(request)
  }

  async tryToResolveAccountCreateRequest(email, otp) {
    const request = await this.pg.otp_account_create_requests.findOne({email: email, otp: otp})
    util.dev.log("Account create", email, otp, request)
    const verification = this.verifyRequest(request, otp)
    if(verification.error != null) {
      return verification
    }

    try {

      const newUser = await this.pg.withTransaction(async (tx) => {
        await tx.otp_account_create_requests.update({id: request.id}, {resolved_at: now()})
        return await tx.users.insert({
          email: request.email,
          first_name: request.first_name,
          last_name: request.last_name,
          display_name: request.display_name,
          newsletter_opt_in: request.newsletter_opt_in
        })
      })

      return { newUser: newUser }

    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: ERROR_CODES.UNEXPECTER_ERROR }
    }
  }

  async createLoginRequest(user) {
    const loginRequest = {
      otp: secureString(),
      requested_at: now(),
      expires_at: standardExpiration(),
      user_id: user.id
    }

    return await this.pg.otp_login_requests.insert(loginRequest)
  }

  async resolveLoginRequest(userId, otp) {
    const request = await this.pg.otp_login_requests.findOne({user_id: userId, otp: otp})
    const verification = this.verifyRequest(request, otp)
    if(verification.error != null) {
      return verification
    }

    try {
      const session = await this.pg.withTransaction(async (tx) => {
        await tx.otp_login_requests.update({id: request.id}, {resolved_at: now()})
        return await this.createSession(userId, tx)
      })

      return { session: session }

    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: ERROR_CODES.UNEXPECTER_ERROR }
    }
  }

  async createSession(userId, tx=null) {
    const db = tx || this.pg
    return await db.sessions.insert({
      user_id: userId,
      secret: secureString(),
      expires_at: null
    })
  }

  tokenFromSession(session) {
    return JSON.stringify({
      secret: session.secret,
      uid: session.user_id
    })
  }

  async sessionFromToken(sessionToken) {
    const sessionObject = JSON.parse(sessionToken)
    const session = await this.pg.sessions.findOne({user_id: sessionObject.uid, secret: sessionObject.secret})
    if(!session || this.isExpired(session)) {
      return null
    } else {
      return session
    }
  }

  verifyRequest(request, otp) {
    if(!request || request.otp != otp) {
      return { error: ERROR_CODES.INVALID_OTP }
    }
    if(this.isExpired(request)) {
      return { error: ERROR_CODES.EXPIRED_OTP }
    }
    if(request.resolved_at) {
      return { error: ERROR_CODES.RESOLVED_OTP }
    }
    return {}
  }
}

Accounts.ERROR_CODES = ERROR_CODES

module.exports = Accounts
