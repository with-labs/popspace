module.exports = class {
  constructor(user) {
    this.user = user
  }

  async userProfile(rooms) {
    const ownedRooms = await rooms.getOwnedRooms(this.user.id)
    const memberRooms = await rooms.getMemberRooms(this.user.id)
    return {
      user: this.user,
      rooms: {
        owned: ownedRooms,
        member: memberRooms
      }
    }
  }
}
