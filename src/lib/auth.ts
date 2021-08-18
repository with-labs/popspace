import { Session } from '@prisma/client';
import moment from 'moment';

import prisma from '../db/prisma';

export class Auth {
  async actorFromToken(token: string) {
    const { actor } = await this.actorAndSessionFromToken(token);
    return actor;
  }

  async actorAndSessionFromToken(token: string) {
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

  tokenFromSession(session: Session) {
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

  async sessionFromToken(sessionToken: string) {
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

  isExpired(entity: { expiresAt?: string | Date }) {
    if (!entity.expiresAt) return false;
    return moment(entity.expiresAt).valueOf() < moment.utc().valueOf();
  }

  // TODO: actor typings based on existing usage
  async needsNewSessionToken(sessionToken: string, actor: any) {
    if (!sessionToken) {
      return true;
    }
    const session = await this.sessionFromToken(sessionToken);
    if (!session) {
      return true;
    }
    return session.actorId != BigInt(actor.id);
  }
}

export default new Auth();
