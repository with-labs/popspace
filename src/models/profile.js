module.exports = class {
  constructor(user) {
    this.user = user
  }

  async serialize() {
    const ownedRoomRoutes = await shared.db.rooms.getOwnedRoutableRooms(this.user.id)
    const memberRoomRoutes = await shared.db.rooms.getMemberRoutableRooms(this.user.id)

    const ownedNamedRooms = await shared.models.NamedRoom.preferredFromRoomsWithRoute(ownedRoomRoutes)
    const memberNamedRooms = await shared.models.NamedRoom.preferredFromRoomsWithRoute(memberRoomRoutes)
    const participantState = await shared.db.dynamo.room.getParticipantState(this.user.id)

    return {
      user: this.user,
      participant_state: participantState,
      rooms: {
        owned: Promise.all(ownedNamedRooms.map(async (r) => await r.serialize())),
        member: Promise.all(memberNamedRooms.map(async (r) => await r.serialize()))
      }
    }
  }
}
