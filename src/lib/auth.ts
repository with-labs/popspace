// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisma'.
const prisma = require('../db/prisma');

const auth = {};

class Auth {
  async actorFromToken(token) {
    const { actor } = await this.actorAndSessionFromToken(token);
    return actor;
  }

  async actorAndSessionFromToken(token) {
    const session = await this.sessionFromToken(token);
    if (!session) {
      return {};
    }
    let actor = await prisma.actor.findUnique({
      where: { id: session.actorId },
    });
    if (actor.deletedAt) {
      actor = null;
    }
    return { actor, session };
  }

  tokenFromSession(session) {
    /*
      At scale, we should use an O(1) store keyed on secrets,
      since btrees on random strings are quite inefficient (i.e.
      postgres is inefficient for session tokens).

      I thought about adding the actor or session ID to the token
      to speed up the query search.

      It'd work! But I think we don't want to leak our internal
      primary (enumerable) IDs. When we're at scale, we should be in
      an O(1) store for sessions anyway, so performance doesn't matter.
    */
    if (session) {
      return session.secret;
    }
  }

  async sessionFromToken(sessionToken) {
    if (!sessionToken) {
      return null;
    }
    const session = await prisma.session.findFirst({
      where: { secret: sessionToken },
    });
    if (!session || this.isExpired(session)) {
      return null;
    } else {
      return session;
    }
  }

  isExpired(entity) {
    if (!entity.expiresAt) return false;
    return moment(entity.expiresAt).valueOf() < moment.utc().valueOf();
  }

  async needsNewSessionToken(sessionToken, actor) {
    if (!sessionToken) {
      return true;
    }
    const session = await this.sessionFromToken(sessionToken);
    if (!session) {
      return true;
    }
    return parseInt(session.actorId) != parseInt(actor.id);
  }
}

module.exports = new Auth();
