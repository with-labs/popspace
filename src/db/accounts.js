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
      throw "No such actor - can only hard delete soft deleted actors."
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

  async createActor(kind, source, expressRequest) {
    return shared.db.pg.massive.withTransaction(async (tx) => {
      const actor = await tx.actors.insert({
        kind: kind
      })
      const sessionId = null
      const event = await shared.db.events.actorCreateEvent(actor.id, sessionId, source, expressRequest, tx)
      return actor
    })
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

  async createSession(actorId, tx=null, req=null) {
    if(!tx) {
      return await shared.db.pg.massive.withTransaction(async (tx) => {
        return await this.createSession(actorId, tx, req)
      })
    }
    const session = await tx.sessions.insert({
      actor_id: actorId,
      secret: shared.lib.otp.generate(),
      expires_at: null
    })

    const meta = null
    /*
      Can't think of anything valuable to record for a session.
      We already have its ID tracked as a column in the schema, and
      there doesn't seem to be any extra info here.
    */
    const eventValue = null
    await shared.db.events.recordEvent(actorId, session.id, "session", eventValue, req, meta, tx)
    return session
  }

  async newsletterSubscribe(actorId) {
    return await shared.db.pg.massive.actors.update({id: actorId}, {newsletter_opt_in: true})
  }

  async newsletterUnsubscribe(actorId) {
    return await shared.db.pg.massive.actors.update({id: actorId}, {newsletter_opt_in: false})
  }

}

module.exports = new Accounts()
