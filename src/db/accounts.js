const prisma = require('./prisma');

const LOGIN_REQUEST_EXPIRY_DAYS = 30;
const SIGNUP_REQUEST_EXPIRY_DAYS = 30;

class Accounts {
  constructor() {}

  async delete(actorId) {
    return await prisma.actor.update({
      where: { id: actorId },
      data: { deletedAt: shared.db.time.now() },
    });
  }

  async hardDelete(actorId) {
    // support hard-deleting soft-deleted actors
    actorId = parseInt(actorId);
    const actor = await prisma.actor.findUnique({ where: { id: actorId } });
    if (!actor || !actor.deletedAt) {
      throw 'No such actor - can only hard delete soft deleted actors.';
    }
    const createdRooms = await shared.db.room.core.getCreatedRooms(actorId);
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

  async actorByEmail(email) {
    const actor = await prisma.actor.findUnique({
      where: {
        email: shared.lib.args.consolidateEmailString(email),
      },
    });
    if (actor.deletedAt) return null;
    return actor;
  }

  actorsByEmails(emails) {
    const consolidatedEmails = emails.map((e) =>
      shared.lib.args.consolidateEmailString(e),
    );
    return prisma.actor.findMany({
      where: {
        email: { in: consolidatedEmails },
        deletedAt: null,
      },
    });
  }

  async actorById(id) {
    const actor = await prisma.actor.findUnique({ where: { id } });
    if (actor.deletedAt) return null;
    return actor;
  }

  createActor(kind, source, expressRequest) {
    return prisma.actor.create({
      data: {
        kind,
        events: {
          create: shared.db.events.eventFromRequest(
            actor.id,
            null,
            'sourced',
            source,
            expressRequest,
          ),
        },
      },
    });
  }

  async createLoginRequest(actor) {
    const loginRequest = {
      code: shared.lib.otp.generate(),
      issuedAt: shared.db.time.now(),
      expiresAt: shared.lib.otp.expirationInNDays(LOGIN_REQUEST_EXPIRY_DAYS),
      actorId: actor.id,
      action: 'login',
    };
    return await prisma.magicCode.create({ data: loginRequest });
  }

  async createSession(actorId, tx = null, req = null) {
    const session = await prisma.session.create({
      data: {
        actorId,
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
    await shared.db.events.recordEvent(
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

  async newsletterSubscribe(actorId) {
    // return await prisma.actor.update(
    //   {where: { id: actorId },
    //   data: { newsletterOptIn: true },
    //   });
  }

  async newsletterUnsubscribe(actorId) {
    // return await prisma.actor.update({
    //   where: { id: actorId },
    //   data: { newsletterOptIn: false },
    // );
  }
}

module.exports = new Accounts();
