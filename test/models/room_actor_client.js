class RoomActorClient {
  constructor(room, actor, client) {
    this.room = room
    this.actor = actor
    this.client = client
  }

  get actorId() {
    return this.actor.id
  }

  async setLogInSession(session) {
    this.session = session
    this.token = await shared.lib.auth.tokenFromSession(session)
  }

  async join() {
    await this.initiateLoggedInSession()
    await this.authenticateSocket()
  }

  async initiateLoggedInSession() {
    if(this.session && this.token) {
      return { session: this.session, token: this.token }
    }
    let session = await shared.db.pg.massive.sessions.findOne({
      actor_id: this.actor.id,
      expires_at: null
    })
    if(!session) {
      session = await shared.test.factory.create("session", {actor_id: this.actor.id})
    }
    this.setLogInSession(session)
    return { session: this.session, token: this.token }
  }

  async authenticateSocket() {
    if(this.auth) {
      return this.atuh
    }
    await this.client.connect()
    const auth = await this.client.authenticate(this.token, this.room.url_id)
    this.auth = auth
    return auth
  }

  async enableRoomAccess(room) {
    const alreadyCanEnter = await shared.db.room.permission.canEnter(this.actor, room)
    if(!alreadyCanEnter) {
      await shared.db.room.memberships.forceMembership(room, this.actor)
    }
  }
}

RoomActorClient.anyOrCreate = async () => {
  let actor = await shared.db.pg.massive.actors.findOne({})
  if(!actor) {
     actor = await shared.test.factory.create("actor")
  }
  return RoomActorClient.forActor(actor)
}

RoomActorClient.create = async (inRoom) => {
  const actor = await shared.test.factory.create("actor")
  return RoomActorClient.forActor(actor, inRoom)
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
      const isPublic = true
      room = await shared.db.room.core.createEmptyRoom(actor.id, isPublic, shared.test.chance.company())
    }
  }
  const client = new lib.Client(lib.appInfo.wssUrl())
  const result = new RoomActorClient(room, actor, client)
  await result.join()
  return result
}

module.exports = RoomActorClient
