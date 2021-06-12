class Permissions {
  async canEnter(actor, room) {
    if(!room || !actor) {
      return false
    }
    if(room.is_public) {
      return true
    }
    if(room.creator_id == actor.id) {
      return true
    }
    return await this.isMember(actor, room)
  }


  async isMemberOrCreator(actor, room) {
    if(room.creator_id == actor.id) {
      return true
    }
    return await shared.db.room.memberships.isMember(actor.id, room.id)
  }

  async isMember(actor, room) {
    return await shared.db.room.memberships.isMember(actor.id, room.id)
  }

  async isCreator(actor, room) {
    return room.creator_id == actor.id
  }
}

module.exports = new Permissions()
