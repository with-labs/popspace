/*
  A RoomActor is an actor connected to a room
*/
class RoomActor {
  constructor(room, actor) {
    this.room = room
    this.actor = actor
  }

  get roomId() {
    return this.room.id
  }

  get actorId() {
    return this.actor.id
  }

  async serialize() {
    return {
      actor: (await this.actor.serialize()),
      room: (await this.room.serialize())
    }
  }
}

module.exports = RoomActor
