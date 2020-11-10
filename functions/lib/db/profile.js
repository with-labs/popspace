module.exports = class {
  constructor(user) {
    this.user = user
  }

  async userProfile() {
    const ownedRooms = await db.rooms.getOwnedRooms(this.user.id)
    const memberRooms = await db.rooms.getMemberRooms(this.user.id)

    return {
      user: this.user,
      rooms: {
        owned: db.rooms.namedRoomsListToMostPreferredList(ownedRooms),
        member: db.rooms.namedRoomsListToMostPreferredList(memberRooms)
      }
    }
  }
}
