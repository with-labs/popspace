class RoomUserClient {
  constructor(room, user, client, roomNameEntry) {
    this.user = user
    this.room = room
    this.client = client
    this.roomNameEntry = roomNameEntry
  }

  setLogInSession(session, token) {
    this.session = session
    this.token = token
  }

  async initiateLoggedInSession() {
    // TODO: find valid session if available
    const session = await factory.create("session", {user_id: this.user.id})
    const token = await shared.lib.auth.tokenFromSession(session)
    this.setLogInSession(session, token)
    return { session, token }
  }

  async authenticateSocket() {
    const auth = await this.client.authenticate(this.token, this.roomNameEntry.name)
    this.auth = auth
  }
}

module.exports = RoomUserClient
