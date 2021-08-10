const prisma = require('../db/prisma');

class RoomMember {
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
  const memberships = await prisma.roomMembership.findFirst({
    where: {
      room_id: roomId,
      revoked_at: null,
    },
  });
  const actorIds = memberships.map((m) => m.actor_id);
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
    actorById[actor.id] = actor;
  }
  for (const ps of participantStates) {
    participantStatesByActorId[ps.actor_id] = ps;
  }

  const room = await shared.db.room.core.roomById(roomId);

  const result = [];
  for (const actorId of actorIds) {
    const roomMember = new RoomMember(
      room,
      actorById[actorId],
      participantStatesByActorId[actorId],
    );
    result.push(roomMember);
  }
  return result;
};

module.exports = RoomMember;
