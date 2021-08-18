import { Room } from '@prisma/client';

import _error from '../../error/_error';
import _models from '../../models/_models';
import prisma from '../prisma';
import time from '../time';

export class Memberships {
  async isMember(actorId: bigint, roomId: bigint) {
    const membership = await this.getMembership(actorId, roomId);
    if (!membership) {
      return false;
    }
    const current = time.timestamptzStillCurrent(membership.expiresAt);
    return current;
  }

  getMembership(actorId: bigint, roomId: bigint) {
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

  getRoomMembers(roomId: bigint) {
    return _models.RoomMember.allInRoom(roomId);
  }

  async revokeMembership(roomId: bigint, actorId: bigint) {
    return prisma.roomMembership.updateMany({
      where: {
        actorId,
        roomId,
        revokedAt: null,
      },
      data: { revokedAt: time.now() },
    });
  }

  // TODO: typing of actor based on existing usage
  forceMembership = async (room: Room, actor: any) => {
    /*
      NOTE: we're currently allowing room creators to be members.

      It seems that creating a room should allow joining it by default.

      We can either allow creators to join, or make creators members.

      Perhaps it's easier to just make everyone a member, and in situations
      where creators should be treated differently, they can explicitly be
      treated differently.
    */
    const existingMembership = await this.getMembership(actor.id, room.id);
    if (existingMembership) {
      return existingMembership;
    }
    try {
      let expiresAt = null; // non-expiring memberships by default
      const membership = await prisma.roomMembership.create({
        data: {
          roomId: room.id,
          actorId: actor.id,
          beganAt: time.now(),
          expiresAt,
        },
      });
      return { membership };
    } catch (e) {
      // TODO: ERROR_LOGGING
      return { error: _error.code.UNEXPECTED_ERROR };
    }
  };
}

export default new Memberships();
