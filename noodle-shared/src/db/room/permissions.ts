import { Room } from '@prisma/client';

import memberships from './memberships';

export class Permissions {
  // TODO: actor typing based on existing usage
  async canEnter(actor: any, room: Room) {
    if (!room || !actor) {
      return false;
    }
    if (actor.admin || room.creatorId == actor.id) {
      return true;
    }
    // public links are open to anyone; password-protected rooms grant
    // membership once the password is entered
    if (room.isPublic && !room.passwordHash) {
      return true;
    }
    return await this.isMember(actor, room);
  }

  /*
    Access to a room's files and documents. Stricter than canEnter: guests
    of public rooms become members when they join, but holding a session
    alone isn't enough to read content of a room you never entered.
  */
  async canAccessContent(actor: any, room: Room) {
    if (!room || !actor) {
      return false;
    }
    if (actor.admin || room.creatorId == actor.id) {
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
