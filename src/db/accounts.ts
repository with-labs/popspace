import { Request } from 'express';

import otplib from '../lib/otp';
import events from './events';
import prisma from './prisma';
import time from './time';

const LOGIN_REQUEST_EXPIRY_DAYS = 30;
const SIGNUP_REQUEST_EXPIRY_DAYS = 30;

export class Accounts {
  constructor() {}

  async delete(actorId: bigint) {
    return await prisma.actor.update({
      where: { id: actorId },
      data: { deletedAt: time.now() },
    });
  }

  async hardDelete(actorId: bigint) {
    // support hard-deleting soft-deleted actors
    const actor = await prisma.actor.findUnique({ where: { id: actorId } });
    if (!actor || !actor.deletedAt) {
      throw 'No such actor - can only hard delete soft deleted actors.';
    }
    const createdRooms = await prisma.room.findMany({
      where: {
        creatorId: actorId,
      },
    });
    const roomIds = createdRooms.map((r) => r.id);
    const membershipsToOwnedRooms = await prisma.roomMembership.findMany({
      where: {
        roomId: {
          in: roomIds,
        },
      },
    });
    const membershipsToOwnedRoomsIds = membershipsToOwnedRooms.map((m) => m.id);
    const widgets = await prisma.widget.findMany({
      where: { creatorId: actorId },
    });
    const widgetIds = widgets.map((w) => w.id);

    await prisma.$transaction([
      prisma.actor.delete({ where: { id: actorId } }),
      prisma.session.deleteMany({ where: { actorId } }),
      prisma.magicCode.deleteMany({ where: { actorId } }),
      // All room membership info
      prisma.roomMembership.deleteMany({ where: { actorId } }),
      // All actors rooms, their members and metainfo
      prisma.roomMembership.deleteMany({
        where: { id: { in: membershipsToOwnedRoomsIds } },
      }),
      prisma.room.deleteMany({ where: { creatorId: actorId } }),
      prisma.widget.deleteMany({ where: { creatorId: actorId } }),
      prisma.widgetTransform.deleteMany({
        where: { widgetId: { in: widgetIds } },
      }),
      prisma.widgetState.deleteMany({ where: { widgetId: { in: widgetIds } } }),
      prisma.participant.deleteMany({ where: { actorId } }),
      prisma.participantState.delete({ where: { actorId } }),
      prisma.participantTransform.deleteMany({ where: { actorId } }),
    ]);
  }

  // TODO: delete? Actors don't have emails.

  // async actorByEmail(email: string) {
  //   const actor = await prisma.actor.findFirst({
  //     where: {
  //       email: args.consolidateEmailString(email),
  //     },
  //   });
  //   if (actor.deletedAt) return null;
  //   return actor;
  // }

  // actorsByEmails(emails) {
  //   const consolidatedEmails = emails.map((e) =>
  //     // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
  //     shared.lib.args.consolidateEmailString(e),
  //   );
  //   return prisma.actor.findMany({
  //     where: {
  //       email: { in: consolidatedEmails },
  //       deletedAt: null,
  //     },
  //   });
  // }

  async actorById(id: bigint) {
    const actor = await prisma.actor.findUnique({ where: { id } });
    if (actor.deletedAt) return null;
    return actor;
  }

  createActor(kind: string, source: string, expressRequest: Request) {
    return prisma.actor.create({
      data: {
        kind,
        events: {
          create: events.eventFromRequest(
            undefined,
            null,
            'sourced',
            source,
            expressRequest,
          ),
        },
      },
    });
  }

  // TODO: typing for actor based on existing usage
  async createLoginRequest(actor: any) {
    const loginRequest = {
      code: otplib.generate(),
      issuedAt: time.now(),
      expiresAt: otplib.expirationInNDays(LOGIN_REQUEST_EXPIRY_DAYS),
      actorId: actor.id,
      action: 'login',
    };
    return await prisma.magicCode.create({ data: loginRequest });
  }

  async createSession(actorId: bigint, tx = null, req: Request | null = null) {
    const session = await prisma.session.create({
      data: {
        actorId,
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        secret: shared.lib.otp.generate(),
        expiresAt: null,
      },
    });

    const meta = null;
    /*
      Can't think of anything valuable to record for a session.
      We already have its ID tracked as a column in the schema, and
      there doesn't seem to be any extra info here.
    */
    const eventValue = null;
    await events.recordEvent(
      actorId,
      session.id,
      'session',
      eventValue,
      req,
      meta,
    );
    return session;
  }

  // TODO: email subscriptions, again.

  async newsletterSubscribe(actorId: bigint) {
    // return await prisma.actor.update(
    //   {where: { id: actorId },
    //   data: { newsletterOptIn: true },
    //   });
  }

  async newsletterUnsubscribe(actorId: bigint) {
    // return await prisma.actor.update({
    //   where: { id: actorId },
    //   data: { newsletterOptIn: false },
    // );
  }
}

export default new Accounts();
