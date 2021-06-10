class RoomUserClient {
  constructor(room, user, client, roomRouteEntry) {
    this.user = user
    this.room = room
    this.client = client
    this.roomRouteEntry = roomRouteEntry
  }

  get userId() {
    return this.user.id
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
      user_id: this.user.id,
      expires_at: null
    })
    if(!session) {
      session = await factory.create("session", {user_id: this.user.id})
    }
    this.setLogInSession(session)
    return { session: this.session, token: this.token }
  }

  async authenticateSocket() {
    await this.client.connect()
    const auth = await this.client.authenticate(this.token, this.roomRouteEntry.route)
    this.auth = auth
  }
}

RoomUserClient.anyOrCreate = async () => {
  let user = await shared.db.pg.massive.users.findOne({})
  if(!user) {
     user = await factory.create("user")
  }
  return RoomUserClient.forUser(user)
}

RoomUserClient.forAnyUser = async () => {
  const user = await shared.db.pg.massive.users.findOne({})
  return RoomUserClient.forUser(user)
}

RoomUserClient.forUserId = async (userId, roomId=null) => {
  const user = await shared.db.pg.massive.users.findOne({id: userId})
  let room
  if(roomId) {
    room = await shared.db.pg.massive.rooms.findOne({id: roomId})
  }
  return RoomUserClient.forUser(user, room)
}

RoomUserClient.forUser = async (user, room=null) => {
  if(!room) {
    room = await shared.db.pg.massive.rooms.findOne({owner_id: user.id, deleted_at: null})
    if(!room) {
      const isEmptyRoom = true
      room = await shared.db.rooms.createRoomFromDisplayName(shared.test.chance.company(), user.id, isEmptyRoom)
    }
  }
  const roomRouteEntry = await shared.db.rooms.latestMostPreferredRouteEntry(room.id)
  const client = new lib.Client(lib.appInfo.wssUrl())
  const result = new RoomUserClient(room, user, client, roomRouteEntry)
  await result.initiateLoggedInSession()
  await result.authenticateSocket()
  return result
}

module.exports = RoomUserClient
