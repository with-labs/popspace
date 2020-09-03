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
    const requests = await db.pg.massive.otp_account_create_requests.find({
      email: util.args.consolidateEmailString(email)
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
    return db.pg.massive.users.findOne({email: util.args.consolidateEmailString(email)})
  }

  async userById(id) {
    return db.pg.massive.users.findOne({id: id})
  }

  /*
    params = {
      email: string,
      firstName: string,
      lastName: string,
      displayName: string,
      newsletterOptIn: boolean
    }
  */
  async tryToCreateAccountRequest(params) {
    const request = {
      first_name: params.firstName,
      last_name: params.lastName,
      display_name: `${params.firstName} ${params.lastName}`,
      email: util.args.consolidateEmailString(params.email),
      newsletter_opt_in: params.receiveMarketing,
      otp: lib.db.otp.generate(),
      requested_at: this.now(),
      expires_at: lib.db.otp.standardExpiration()
    }
    return await db.pg.massive.otp_account_create_requests.insert(request)
  }

  async findAndResolveAccountCreateRequest(email, otp) {
    const request = await db.pg.massive.otp_account_create_requests.findOne({email: util.args.consolidateEmailString(email), otp: otp})
    return await this.tryToResolveAccountCreateRequest(request, otp)
  }

  async tryToResolveAccountCreateRequest(request, otp) {
    const verification = lib.db.otp.verify(request, otp)
    if(verification.error != null) {
      return verification
    }
    try {
      const newUser = await db.pg.massive.withTransaction(async (tx) => {
        await tx.otp_account_create_requests.update({id: request.id}, {resolved_at: this.now()})
        return await tx.users.insert({
          email: util.args.consolidateEmailString(request.email),
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

    return await db.pg.massive.otp_login_requests.insert(loginRequest)
  }

  async resolveLoginRequest(userId, otp) {
    const request = await db.pg.massive.otp_login_requests.findOne({user_id: userId, otp: otp})
    const verification = lib.db.otp.verify(request, otp)
    if(verification.error != null) {
      return verification
    }

    try {
      const session = await db.pg.massive.withTransaction(async (tx) => {
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
    const db = tx || db.pg.massive
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
    const session = await db.pg.massive.sessions.findOne({user_id: sessionObject.uid, secret: sessionObject.secret})
    if(!session || lib.db.otp.isExpired(session)) {
      return null
    } else {
      return session
    }
  }

  async needsNewSessionToken(sessionToken, user) {
    if(!sessionToken) {
      return true
    }
    const session = await this.sessionFromToken(sessionToken)
    return parseInt(session.user_id) == parseInt(user.id)
  }

}

module.exports = Accounts
