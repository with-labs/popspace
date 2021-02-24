module.exports = class {
  constructor() {
    this.loggedInUsers = []
    this.mercury = null
  }

  setMercury(mercury) {
    this.mercury = mercury
  }

  async createLoggedInUser(client, room=null, roomNameEntry=null) {
    const created = await this.createUserWithRoomAccess(client, room, roomNameEntry)
    return this.logIntoRoom(client, created.user, created.room, created.roomNameEntry)
  }

  async createClientWithRoomAccess(room, roomNameEntry) {
    const clients = await tlib.util.addClients(this.mercury, 1)
    const client = clients[0]
    const created = await this.createUserWithRoomAccess(client, room, roomNameEntry)
    const roomUserClient = new tlib.models.RoomUserClient(created.room, created.user, client, created.roomNameEntry)
    return roomUserClient
  }

  async createUserWithRoomAccess(client, room, roomNameEntry) {
    const user = await factory.create("user")
    if(room && room.owner_id != user.id) {
      const alreadyHasAccess = await shared.db.roomMemberships.hasAccess(user.id, room.id)
      if(!alreadyHasAccess) {
        await shared.db.roomMemberships.forceMembership(room.id, user)
      }
    } else {
      const isEmptyRoom = true
      let roomInfo = await shared.db.rooms.generateRoom(user.id, isEmptyRoom)
      room = roomInfo.room
      roomNameEntry = roomInfo.roomNameEntry
    }

    return { user, room, roomNameEntry }
  }

  async logIntoRoom(client, user, room, roomNameEntry) {
    // TODO: this should move out to RoomUserClient
    const { session, token } = await this.initiateLoggedInSession(user.id)
    const roomUserClient = new tlib.models.RoomUserClient(room, user, client, roomNameEntry)
    roomUserClient.setLogInSession(session, token)
    this.loggedInUsers.push(roomUserClient)
    return roomUserClient
  }

  async initiateLoggedInSession(userId) {
    // TODO: move this out to RoomUserClient
    const session = await factory.create("session", {user_id: userId})
    const token = await shared.lib.auth.tokenFromSession(session)
    return { session, token }
  }

  async authenticate(roomUserClient) {
    // TODO: I don't think we can replace this with roomUserClient.authenticate(), since we
    // have some places where we haven't transitioned to using the class yet (in the tests themselves)
    const auth = await roomUserClient.client.authenticate(roomUserClient.token, roomUserClient.roomNameEntry.name)
    roomUserClient.auth = auth
  }
}
