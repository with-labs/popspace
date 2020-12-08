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
    if(!room) {
      let roomInfo = await shared.db.rooms.generateRoom(user.id)
      room = roomInfo.room
      roomNameEntry= roomInfo.roomNameEntry
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
