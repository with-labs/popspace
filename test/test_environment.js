module.exports = class {
  constructor() {
    this.loggedInActors = []
  }

  async createLoggedInActor(client, room=null) {
    const created = await this.createActorWithRoomAccess(client, room)
    return this.logIntoRoom(client, created.actor, created.room)
  }

  async createActorWithRoomAccess(client, room) {
    const actor = await factory.create("actor")
    if(room && room.creator_id != actor.id) {
      const alreadyHasAccess = await shared.db.roomMemberships.hasAccess(actor.id, room.id)
      if(!alreadyHasAccess) {
        await shared.db.roomMemberships.forceMembership(room.id, actor)
      }
    } else {
      const isEmptyRoom = true
      let roomInfo = await shared.db.rooms.generateRoom(actor.id, isEmptyRoom)
      room = roomInfo.room
    }

    return { actor, room }
  }

  async logIntoRoom(client, actor, room) {
    // TODO: this should move out to RoomActorClient
    const { session, token } = await this.initiateLoggedInSession(actor.id)
    const roomActorClient = new tlib.models.RoomActorClient(room, actor, client)
    await roomActorClient.setLogInSession(session, token)
    this.loggedInActors.push(roomActorClient)
    return roomActorClient
  }

  async initiateLoggedInSession(actorId) {
    // TODO: move this out to RoomActorClient
    const session = await factory.create("session", {actor_id: actorId})
    const token = await shared.lib.auth.tokenFromSession(session)
    return { session, token }
  }

  async authenticate(roomActorClient) {
    // TODO: I don't think we can replace this with roomActorClient.authenticate(), since we
    // have some places where we haven't transitioned to using the class yet (in the tests themselves)
    const auth = await roomActorClient.client.authenticate(roomActorClient.token, roomActorClient.room)
    roomActorClient.auth = auth
  }
}
