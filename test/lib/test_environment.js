module.exports = class {
  constructor() {
    this.loggedInUsers = []
  }

  async createLoggedInUser(client) {
    const user = await factory.create("user")
    const session = await factory.create("session")
    const token = await shared.lib.auth.tokenFromSession(session)
    const { room, nameEntry } = await shared.db.rooms.generateRoom(user.id)
    const result = { user, session, token, room, client, roomNameEntry: nameEntry }
    this.loggedInUsers.push(result)
    return result
  }
}
