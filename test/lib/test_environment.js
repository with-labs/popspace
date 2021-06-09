module.exports = class {
  constructor() {
    this.loggedInUsers = []
    this.mercury = null
  }

  setMercury(mercury) {
    this.mercury = mercury
  }

  async createLoggedInUser(client, room=null, roomRouteEntry=null) {
    const created = await this.createUserWithRoomAccess(client, room, roomRouteEntry)
    return this.logIntoRoom(client, created.user, created.room, created.roomRouteEntry)
  }

  async createClientWithRoomAccess(room, roomRouteEntry) {
    const clients = await tlib.util.addClients(this.mercury, 1)
    const client = clients[0]
    const created = await this.createUserWithRoomAccess(client, room, roomRouteEntry)
    const roomUserClient = new tlib.models.RoomUserClient(created.room, created.user, client, created.roomRouteEntry)
    return roomUserClient
  }

  async createUserWithRoomAccess(client, room, roomRouteEntry) {
    const user = await factory.create("user")
    if(room && room.owner_id != user.id) {
      const alreadyCanEnter = await shared.db.room.permission.canEnter(user, room)
      if(!alreadyCanEnter) {
        await shared.db.room.memberships.forceMembership(room, user)
      }
    } else {
      const isEmptyRoom = true
      let roomInfo = await shared.db.rooms.generateRoom(user.id, isEmptyRoom)
      room = roomInfo.room
      roomRouteEntry = roomInfo.roomRouteEntry
    }

    return { user, room, roomRouteEntry }
  }

  async logIntoRoom(client, user, room, roomRouteEntry) {
    // TODO: this should move out to RoomUserClient
    const { session, token } = await this.initiateLoggedInSession(user.id)
    const roomUserClient = new tlib.models.RoomUserClient(room, user, client, roomRouteEntry)
    await roomUserClient.setLogInSession(session, token)
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
    const auth = await roomUserClient.client.authenticate(roomUserClient.token, roomUserClient.roomRouteEntry.route)
    roomUserClient.auth = auth
  }
}
