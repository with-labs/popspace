// @ts-expect-error ts-migrate(2300) FIXME: Duplicate identifier 'Permissions'.
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    return await shared.db.room.memberships.isMember(actor.id, room.id);
  }

  async isMember(actor, room) {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
    return await shared.db.room.memberships.isMember(actor.id, room.id);
  }

  async isCreator(actor, room) {
    return room.creatorId == actor.id;
  }
}

module.exports = new Permissions();
