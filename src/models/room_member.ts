import _db from '../db/_index';
import prisma from '../db/prisma';

// FIXME: confusing, maybe broken typings
class RoomMember {
  static allInRoom: any;

  actor: any;
  participantState: any;
  room: any;

  constructor(room, actor, participantState) {
    this.room = room;
    this.actor = actor;
    this.participantState = participantState;
  }

  get roomId() {
    return this.room.id;
  }

  get actorId() {
    return this.actor.id;
  }

  async serialize() {
    return {
      actor: await this.actor.serialize(),
      room: await this.room.serialize(),
      participantState: this.participantState,
    };
  }
}

RoomMember.allInRoom = async (roomId) => {
  const memberships = await prisma.roomMembership.findMany({
    where: {
      roomId,
      revokedAt: null,
    },
  });
  const actorIds = memberships.map((m) => m.actorId);
  const actors = await prisma.actor.findMany({
    where: { id: { in: actorIds } },
  });
  const participantStates = await prisma.participantState.findMany({
    where: {
      actorId: {
        in: actorIds,
      },
    },
  });

  const actorById = {};
  const participantStatesByActorId = {};
  for (const actor of actors) {
    actorById[actor.id.toString()] = actor;
  }
  for (const ps of participantStates) {
    participantStatesByActorId[ps.actorId.toString()] = ps;
  }

  const room = await _db.room.core.roomById(roomId);

  const result = [];
  for (const actorId of actorIds) {
    const roomMember = new RoomMember(
      room,
      actorById[actorId.toString()],
      participantStatesByActorId[actorId.toString()],
    );
    result.push(roomMember);
  }
  return result;
};

export default RoomMember;
