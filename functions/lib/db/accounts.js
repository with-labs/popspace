const DbAccess = require("./pg/db_access")

class Accounts extends DbAccess {
  constructor() {
    super()
  }

  getSignupUrl(appUrl, accountCreateRequest) {
    return `${appUrl}/complete_signup?otp=${accountCreateRequest.otp}&email=${accountCreateRequest.email}`
  }

  getLoginUrl(appUrl, loginRequest) {
    return `${appUrl}/login?otp=${loginRequest.otp}&uid=${loginRequest.user_id}`
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
    request.otp = lib.db.otp.generate()
    request.requested_at = this.now()
    request.expires_at = lib.db.otp.standardExpiration()

    return await this.pg.otp_account_create_requests.insert(request)
  }

  async tryToResolveAccountCreateRequest(email, otp) {
    const request = await this.pg.otp_account_create_requests.findOne({email: email, otp: otp})
    const verification = lib.db.otp.verify(request, otp)
    if(verification.error != null) {
      return verification
    }

    try {

      const newUser = await this.pg.withTransaction(async (tx) => {
        await tx.otp_account_create_requests.update({id: request.id}, {resolved_at: this.now()})
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
      return { error: lib.db.ErrorCodes.UNEXPECTER_ERROR }
    }
  }

  async createLoginRequest(user) {
    const loginRequest = {
      otp: lib.db.otp.generate(),
      requested_at: this.now(),
      expires_at: lib.db.otp.standardExpiration(),
      user_id: user.id
    }

    return await this.pg.otp_login_requests.insert(loginRequest)
  }

  async resolveLoginRequest(userId, otp) {
    const request = await this.pg.otp_login_requests.findOne({user_id: userId, otp: otp})
    const verification = lib.db.otp.verify(request, otp)
    if(verification.error != null) {
      return verification
    }

    try {
      const session = await this.pg.withTransaction(async (tx) => {
        await tx.otp_login_requests.update({id: request.id}, {resolved_at: this.now()})
        return await this.createSession(userId, tx)
      })

      return { session: session }

    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: lib.db.ErrorCodes.UNEXPECTER_ERROR }
    }
  }

  async createSession(userId, tx=null) {
    const db = tx || this.pg
    return await db.sessions.insert({
      user_id: userId,
      secret: lib.db.otp.generate(),
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
    if(!session || lib.db.otp.isExpired(session)) {
      return null
    } else {
      return session
    }
  }

}

module.exports = Accounts
