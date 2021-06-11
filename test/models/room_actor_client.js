class RoomActorClient {
  /*
    NOTE: this isn't ready for prime time,
    since it's a bit too specific to mercury/hermes.

    This can either be the domain of hermes, or
    maybe there's utility in a shared socket client.

    TBD.
  */
  constructor(room, actor, client) {
    this.room = room
    this.actor = actor
    this.client = client
  }

  get actorId() {
    return this.actor.id
  }

  async setLogInSession(session, token=null) {
    this.session = session
    if(!token) {
      // TODO: ideally I'd like to remove the optional token
      // so I want to upgrade the test framework to not create these
      token = await shared.lib.auth.tokenFromSession(session)
    }
    this.token = token
  }

  async initiateLoggedInSession() {
    let session = await shared.db.pg.massive.sessions.findOne({
      actor_id: this.actor.id,
      expires_at: null
    })
    if(!session) {
      session = await factory.create("session", {actor_id: this.actor.id})
    }
    this.setLogInSession(session)
    return { session: this.session, token: this.token }
  }

  async authenticateSocket() {
    await this.client.connect()
    const auth = await this.client.authenticate(this.token, this.room.url_id)
    this.auth = auth
  }
}

RoomActorClient.anyOrCreate = async () => {
  let actor = await shared.db.pg.massive.actors.findOne({})
  if(!actor) {
     actor = await factory.create("actor")
  }
  return RoomActorClient.forActor(actor)
}

RoomActorClient.forAnyActor = async () => {
  const actor = await shared.db.pg.massive.actors.findOne({})
  return RoomActorClient.forActor(actor)
}

RoomActorClient.forActorId = async (actorId, roomId=null) => {
  const actor = await shared.db.pg.massive.actors.findOne({id: actorId})
  let room
  if(roomId) {
    room = await shared.db.pg.massive.rooms.findOne({id: roomId})
  }
  return RoomActorClient.forActor(actor, room)
}

RoomActorClient.forActor = async (actor, room=null) => {
  if(!room) {
    room = await shared.db.pg.massive.rooms.findOne({creator_id: actor.id, deleted_at: null})
    if(!room) {
      const isEmptyRoom = true
      room = await shared.db.rooms.createRoomFromDisplayName(shared.test.chance.company(), actor.id, isEmptyRoom)
    }
  }
  const client = new lib.Client(lib.appInfo.wssUrl())
  const result = new RoomActorClient(room, actor, client)
  await result.initiateLoggedInSession()
  await result.authenticateSocket()
  return result
}

module.exports = RoomActorClient
