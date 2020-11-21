module.exports = class {
  constructor() {
    this.loggedInUsers = []
  }

  async createLoggedInUser(client) {
    const user = await factory.create("user")
    const session = await factory.create("session")
    const token = await shared.lib.auth.tokenFromSession(session)
    const room = await factory.create('room', { owner_id: user.id })
    const result = { user, session, token, room, client }
    this.loggedInUsers.push(result)
    return result
  }
}
