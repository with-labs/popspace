module.exports = class {
  constructor(user) {
    this.user = user
  }

  async userProfile() {
    const ownedRooms = await shared.db.rooms.getOwnedRooms(this.user.id)
    const memberRooms = await shared.db.rooms.getMemberRooms(this.user.id)

    return {
      user: this.user,
      rooms: {
        owned: shared.db.rooms.namedRoomsListToMostPreferredList(ownedRooms),
        member: shared.db.rooms.namedRoomsListToMostPreferredList(memberRooms)
      }
    }
  }
}
