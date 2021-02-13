module.exports = class {
  constructor() {
    this.loggedInUsers = []
    this.mercury = null
  }

  setMercury(mercury) {
    this.mercury = mercury
  }

  async createLoggedInUser(client, room=null, roomNameEntry=null) {
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
    return this.logIntoRoom(client, user, room, roomNameEntry)
  }

  async logIntoRoom(client, user, room, roomNameEntry) {
    const session = await factory.create("session", {user_id: user.id})
    const token = await shared.lib.auth.tokenFromSession(session)
    const environmentUser = { user, session, token, room, client, roomNameEntry }
    this.loggedInUsers.push(environmentUser)
    return environmentUser
  }

  async authenticate(environmentUser) {
    const auth = await environmentUser.client.authenticate(environmentUser.token, environmentUser.roomNameEntry.name)
    environmentUser.auth = auth
  }
}
