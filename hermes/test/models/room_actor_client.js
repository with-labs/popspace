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
    return await this.authenticateSocket()
  }

  async initiateLoggedInSession() {
    if(this.session && this.token) {
      return { session: this.session, token: this.token }
    }
    let session = await shared.db.prisma.session.findFirst({
      where: {
        actorId: this.actor.id,
        expiresAt: null
      }
    })
    if(!session) {
      session = await shared.db.accounts.createSession(this.actor.id)
    }
    this.setLogInSession(session)
    return { session: this.session, token: this.token }
  }

  async authenticateSocket() {
    if(this.auth) {
      return this.atuh
    }
    await this.client.connect()
    const auth = await this.client.authenticate(this.token, this.room.urlId)
    this.auth = auth
    if(this.afterJoin) {
      this.afterJoin(this)
      delete this.afterJoin
    }
    return auth
  }

  async enableRoomAccess(room) {
    const alreadyCanEnter = await shared.db.room.permissions.canEnter(this.actor, room)
    if(!alreadyCanEnter) {
      await shared.db.room.memberships.forceMembership(room, this.actor)
    }
  }

  async onceAfterJoin(callback) {
    if(this.auth) {
      return callback(this)
    }
    this.afterJoin = callback
  }
}

RoomActorClient.anyOrCreate = async () => {
  let actor = await shared.db.prisma.actor.findFirst()
  if(!actor) {
     actor = await shared.db.accounts.createActor("test")
  }
  return RoomActorClient.forActor(actor)
}

RoomActorClient.create = async (inRoom) => {
  const actor = await shared.db.accounts.createActor("test")
  return RoomActorClient.forActor(actor, inRoom)
}

RoomActorClient.forAnyActor = async () => {
  const actor = await shared.db.prisma.actor.findFirst()
  return RoomActorClient.forActor(actor)
}

RoomActorClient.forActorId = async (actorId, roomId=null) => {
  const actor = await shared.db.prisma.actor.findUnique({ where: {id: actorId } })
  let room
  if(roomId) {
    room = await shared.db.prisma.room.findUnique({ where: {id: roomId } })
  }
  return RoomActorClient.forActor(actor, room)
}

RoomActorClient.forActor = async (actor, room=null) => {
  if(!actor) {
     actor = await shared.db.accounts.createActor("test")
  }
  if(!room) {
    room = await shared.db.prisma.room.findFirst({ where: {creatorId: actor.id, deletedAt: null } })
    if(!room) {
      const isPublic = true
      const roomWithData = await shared.db.room.core.createEmptyRoom(actor.id, isPublic, shared.test.chance.company())
      room = roomWithData.room
    }
  }
  const client = new lib.Client(lib.appInfo.wssUrl())
  const result = new RoomActorClient(room, actor, client)
  return result
}

module.exports = RoomActorClient
