import { Room } from '@prisma/client';

import memberships from './memberships';

export class Permissions {
  // TODO: actor typing based on existing usage
  async canEnter(actor: any, room: Room) {
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

  async isMemberOrCreator(actor: any, room: Room) {
    if (room.creatorId == actor.id) {
      return true;
    }
    return await memberships.isMember(actor.id, room.id);
  }

  async isMember(actor: any, room: Room) {
    return await memberships.isMember(actor.id, room.id);
  }

  async isCreator(actor, room) {
    return room.creatorId == actor.id;
  }
}

export default new Permissions();
