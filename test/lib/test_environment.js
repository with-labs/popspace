module.exports = class {
  constructor() {
    this.loggedInUsers = []
  }

  async createLoggedInUser(client) {
    const user = await factory.create("user")
    const session = await factory.create("session")
    const token = await shared.lib.auth.tokenFromSession(session)
    const room = await factory.create('room', { owner_id: user.id })
    const roomName = await factory.create('room_name', {room_id: room.id})
    const result = { user, session, token, room, roomName, client }
    this.loggedInUsers.push(result)
    return result
  }
}
