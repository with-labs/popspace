const LOGIN_REQUEST_EXPIRY_DAYS = 30
const SIGNUP_REQUEST_EXPIRY_DAYS = 30

class Accounts {
  constructor() {

  }

  async delete(actorId) {
    return await shared.db.pg.massive.actors.update({id: actorId}, {deleted_at: shared.db.time.now()})
  }

  async hardDelete(actorId) {
    // support hard-deleting soft-deleted actors
    actorId = parseInt(actorId)
    const actor = await shared.db.pg.massive.actors.findOne({id: actorId, "deleted_at IS NOT NULL": null})
    if(!actor) {
      throw "No such actor"
    }
    const createdRooms = await shared.db.room.core.getCreatedRooms(actorId)
    const roomIds = createdRooms.map((r) => (r.id))
    const membershipsToOwnedRooms = await shared.db.pg.massive.room_memberships.find({room_id: roomIds})
    const membershipsToOwnedRoomsIds = membershipsToOwnedRooms.map((m) => (m.id))
    const widgets = await shared.db.pg.massive.widgets.find({creator_id: actorId})
    const widgetIds = widgets.map((w) => (w.id))

    await shared.db.pg.massive.withTransaction(async (tx) => {
      await tx.actors.destroy({id: actorId})
      await tx.sessions.destroy({actor_id: actorId})
      await tx.magic_codes.destroy({actor_id: actorId})
      // All room membership info
      await tx.room_memberships.destroy({actor_id: actorId})
      // All actors rooms, their members and metainfo
      await tx.room_memberships.destroy({id: membershipsToOwnedRoomsIds})
      await tx.rooms.destroy({creator_id: actorId})
      await tx.widgets.destroy({creator_id: actorId})
      await tx.room_widgets.destroy({widget_id: widgetIds})
    })
  }

  async actorByEmail(email) {
    return shared.db.pg.massive.actors.findOne({
      email: shared.lib.args.consolidateEmailString(email),
      deleted_at: null
    })
  }

  async actorsByEmails(emails) {
    const consolidatedEmails = emails.map((e) => (shared.lib.args.consolidateEmailString(e)))
    return shared.db.pg.massive.actors.find({email: consolidatedEmails, deleted_at: null})
  }

  async actorById(id) {
    return shared.db.pg.massive.actors.findOne({id: id, deleted_at: null})
  }

  async createActor(kind) {
    const actor = await shared.db.pg.massive.actors.insert({
      kind: kind
    })
    return actor
  }

  async createLoginRequest(actor) {
    const loginRequest = {
      code: shared.lib.otp.generate(),
      issued_at: shared.db.time.now(),
      expires_at: shared.lib.otp.expirationInNDays(LOGIN_REQUEST_EXPIRY_DAYS),
      actor_id: actor.id,
      action: "login"
    }
    return await shared.db.pg.massive.magic_codes.insert(loginRequest)
  }

  async resolveLoginRequest(actorId, code) {
    const request = await shared.db.pg.massive.magic_codes.findOne({
      actor_id: actorId,
      code: code,
      action: "login"
    })
    const verification = shared.lib.otp.verify(request, code)
    if(verification.error != null) {
      return verification
    }
    const session = await this.createSession(actorId)
    return { session: session }
  }

  async createSession(actorId, tx=null) {
    const txOrMassive = tx || shared.db.pg.massive
    return await txOrMassive.sessions.insert({
      actor_id: actorId,
      secret: shared.lib.otp.generate(),
      expires_at: null
    })
  }

  tokenFromSession(session) {
    return JSON.stringify({
      /*
        At scale, we should use an O(1) store keyed on secrets,
        since btrees on random strings are quite inefficient (i.e.
        postgres is inefficient for session tokens).

        I thought about adding the actor or session ID to the token
        to speed up the query search.

        It'd work! But I think we don't want to leak our internal
        primary (enumerable) IDs. When we're at scale, we should be in
        an O(1) store for sessions anyway, so performance doesn't matter.
      */
      secret: session.secret
    })
  }

  async sessionFromToken(sessionToken) {
    const sessionObject = JSON.parse(sessionToken)
    const session = await shared.db.pg.massive.sessions.findOne({secret: sessionObject.secret})
    if(!session || shared.lib.otp.isExpired(session)) {
      return null
    } else {
      return session
    }
  }

  async needsNewSessionToken(sessionToken, actor) {
    if(!sessionToken) {
      return true
    }
    const session = await this.sessionFromToken(sessionToken)
    if(!session) {
      return true
    }
    return parseInt(session.actor_id) != parseInt(actor.id)
  }

  async newsletterSubscribe(actorId) {
    return await shared.db.pg.massive.actors.update({id: actorId}, {newsletter_opt_in: true})
  }

  async newsletterUnsubscribe(actorId) {
    return await shared.db.pg.massive.actors.update({id: actorId}, {newsletter_opt_in: false})
  }

}

module.exports = new Accounts()
