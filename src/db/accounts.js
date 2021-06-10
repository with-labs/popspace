const LOGIN_REQUEST_EXPIRY_DAYS = 30
const SIGNUP_REQUEST_EXPIRY_DAYS = 30

class Accounts {
  constructor() {
  }

  getSignupUrl(appUrl, accountCreateRequest) {
    return `${appUrl}/complete_signup?otp=${encodeURIComponent(accountCreateRequest.otp)}&email=${encodeURIComponent(accountCreateRequest.email)}`
  }

  getLoginUrl(appUrl, loginRequest) {
    return `${appUrl}/loginwithemail?otp=${encodeURIComponent(loginRequest.otp)}&uid=${encodeURIComponent(loginRequest.user_id)}`
  }

  async delete(userId) {
    return await shared.db.pg.massive.users.update({id: userId}, {deleted_at: shared.db.time.now()})
  }

  async hardDelete(userId) {
    // support hard-deleting soft-deleted users
    userId = parseInt(userId)
    const user = await shared.db.pg.massive.users.findOne({id: userId, "deleted_at IS NOT NULL": null})
    if(!user) {
      throw "No such user"
    }
    const email = user.email
    const ownedRooms = await shared.db.rooms.getOwnedRooms(userId)
    const roomIds = ownedRooms.map((r) => (r.id))

    const membershipsToOwnedRooms = await shared.db.pg.massive.room_memberships.find({room_id: roomIds})
    const roomRoutes = await shared.db.pg.massive.room_routes.find({room_id: roomIds})

    const membershipsToOwnedRoomsIds = membershipsToOwnedRooms.map((m) => (m.id))
    const roomRouteIds = roomRoutes.map((n) => (n.id))

    const widgets = await shared.db.pg.massive.widgets.find({owner_id: userId})
    const widgetIds = widgets.map((w) => (w.id))

    await shared.db.pg.massive.withTransaction(async (tx) => {
      await tx.users.destroy({id: userId})
      await tx.sessions.destroy({user_id: userId})
      await tx.magic_codes.destroy({user_id: userId})
      // All room membership info
      await tx.room_memberships.destroy({user_id: userId})
      // All users rooms, their members and metainfo
      await tx.room_routes.destroy({id: roomRouteIds})
      await tx.room_memberships.destroy({id: membershipsToOwnedRoomsIds})
      await tx.rooms.destroy({owner_id: userId})
      await tx.widgets.destroy({owner_id: userId})
      await tx.room_widgets.destroy({widget_id: widgetIds})
    })

  }

  async getLatestAccountCreateRequest(email) {
    const requests = await shared.db.pg.massive.otp_account_create_requests.find({
      email: shared.lib.args.consolidateEmailString(email)
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
    return shared.db.pg.massive.users.findOne({
      email: shared.lib.args.consolidateEmailString(email),
      deleted_at: null
    })
  }

  async usersByEmails(emails) {
    const consolidatedEmails = emails.map((e) => (shared.lib.args.consolidateEmailString(e)))
    return shared.db.pg.massive.users.find({email: consolidatedEmails, deleted_at: null})
  }

  async userById(id) {
    return shared.db.pg.massive.users.findOne({id: id, deleted_at: null})
  }

  async createActor(kind) {
    const actor = await shared.db.pg.massive.users.insert({
      kind: kind
    })
    return actor
  }

  async createLoginRequest(user) {
    const loginRequest = {
      otp: shared.lib.otp.generate(),
      requested_at: shared.db.time.now(),
      expires_at: shared.lib.otp.expirationInNDays(LOGIN_REQUEST_EXPIRY_DAYS),
      user_id: user.id
    }

    return await shared.db.pg.massive.otp_login_requests.insert(loginRequest)
  }

  async resolveLoginRequest(userId, otp) {
    const request = await shared.db.pg.massive.otp_login_requests.findOne({user_id: userId, otp: otp})
    const verification = shared.lib.otp.verify(request, otp)
    if(verification.error != null) {
      return verification
    }

    try {
      const session = await shared.db.pg.massive.withTransaction(async (tx) => {
        await tx.otp_login_requests.update({id: request.id}, {resolved_at: shared.db.time.now()})
        return await this.createSession(userId, tx)
      })

      return { session: session }

    } catch(e) {
      // TODO: ERROR_LOGGING
      return { error: shared.error.code.UNEXPECTER_ERROR }
    }
  }

  async createSession(userId, tx=null) {
    const txOrMassive = tx || shared.db.pg.massive
    return await txOrMassive.sessions.insert({
      user_id: userId,
      secret: shared.lib.otp.generate(),
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
    const session = await shared.db.pg.massive.sessions.findOne({user_id: sessionObject.uid, secret: sessionObject.secret})
    if(!session || shared.lib.otp.isExpired(session)) {
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
    if(!session) {
      return true
    }
    return parseInt(session.user_id) != parseInt(user.id)
  }

  async newsletterSubscribe(userId) {
    return await shared.db.pg.massive.users.update({id: userId}, {newsletter_opt_in: true})
  }

  async newsletterUnsubscribe(userId) {
    return await shared.db.pg.massive.users.update({id: userId}, {newsletter_opt_in: false})
  }


}

module.exports = new Accounts()
