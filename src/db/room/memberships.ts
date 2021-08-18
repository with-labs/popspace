const prisma = require('../prisma');

class Memberships {
  async isMember(actorId, roomId) {
    const membership = await this.getMembership(actorId, roomId);
    if (!membership) {
      return false;
    }
    const current = shared.db.time.timestamptzStillCurrent(
      membership.expires_at,
    );
    return current;
  }

  getMembership(actorId, roomId) {
    return prisma.roomMembership.findFirst({
      where: {
        actorId,
        roomId,
        revokedAt: null,
        beganAt: {
          not: null,
        },
      },
      /*
        There's some optionality here.
        E.g. we could choose the membership that will
        expire the most in the future, though
        not all memberships expire. Perhaps those
        are the best to choose among non-revoked ones anyway.
        On the other hand if we choose the latest issued one,
        seems like that's the one we should give, since
        for whatever reason that membership was accepted.
        In practice, we should only have 1 active membership
        per person anyway.
      */
      orderBy: {
        beganAt: 'desc',
      },
    });
  }

  getRoomMembers(roomId) {
    return shared.models.RoomMember.allInRoom(roomId);
  }

  revokeMembership(roomId, actorId) {
    return prisma.roomMembership.update({
      where: {
        actorId: actorId,
        roomId: roomId,
        revokedAt: null,
      },
      data: { revokedAt: shared.db.time.now() },
    });
  }

  async forceMembership(room, actor) {
    /*
      NOTE: we're currently allowing room creators to be members.

      It seems that creating a room should allow joining it by default.

      We can either allow creators to join, or make creators members.

      Perhaps it's easier to just make everyone a member, and in situations
      where creators should be treated differently, they can explicitly be
      treated differently.
    */
    const existingMembership = await shared.db.room.memberships.getMembership(
      actor.id,
      room.id,
    );
    if (existingMembership) {
      return existingMembership;
    }
    try {
      let expiresAt = null; // non-expiring memberships by default
      const membership = await prisma.roomMembership.create({
        data: {
          roomId: room.id,
          actorId: actor.id,
          beganAt: shared.db.time.now(),
          expiresAt,
        },
      });
      return { membership };
    } catch (e) {
      // TODO: ERROR_LOGGING
      return { error: shared.error.code.UNEXPECTED_ERROR };
    }
  }
}

module.exports = new Memberships();
