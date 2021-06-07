class Permissions {
  async canEnter(user, room) {
    if(!room || !user) {
      return false
    }
    if(room.is_public) {
      return true
    }
    if(room.owner_id == user.id) {
      return true
    }
    return await this.isMember(user, room)
  }


  async isMemberOrOwner(user, room) {
    if(room.owner_id == user.id) {
      return true
    }
    return await shared.db.room.memberships.isMember(user.id, room.id)
  }

  async isMember(user, room) {
    return await shared.db.room.memberships.isMember(user.id, room.id)
  }

  async isOwner(user, room) {
    return room.owner_id == user.id
  }
}

module.exports = new Permissions()
