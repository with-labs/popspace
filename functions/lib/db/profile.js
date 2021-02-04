module.exports = class {
  constructor(user) {
    this.user = user
  }

  async userProfile() {
    const ownedRoomRoutes = await shared.db.rooms.getOwnedRooms(this.user.id)
    const memberRoomRoutes = await shared.db.rooms.getMemberRooms(this.user.id)
    const ownedNamedRooms = await shared.models.NamedRoom.preferredFromRoomsWithRoute(ownedRoomRoutes)
    const memberNamedRooms = await shared.models.NamedRoom.preferredFromRoomsWithRoute(memberRoomRoutes)
    return {
      user: this.user,
      rooms: {
        owned: ownedNamedRooms.map((r) => r.serialize()),
        member: memberNamedRooms.map((r) => r.serialize())
      }
    }
  }
}