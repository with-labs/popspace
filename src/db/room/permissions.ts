class Permissions {
  async canEnter(actor, room) {
    if (!room || !actor) {
      return false;
    }
    if (room.isPublic) {
      return true;
    }
    if (room.creatorId == actor.id) {
      return true;
    }
    return await this.isMember(actor, room);
  }

  async isMemberOrCreator(actor, room) {
    if (room.creatorId == actor.id) {
      return true;
    }
    return await shared.db.room.memberships.isMember(actor.id, room.id);
  }

  async isMember(actor, room) {
    return await shared.db.room.memberships.isMember(actor.id, room.id);
  }

  async isCreator(actor, room) {
    return room.creatorId == actor.id;
  }
}

module.exports = new Permissions();
