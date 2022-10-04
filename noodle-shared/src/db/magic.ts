import { MagicCode } from '@prisma/client';

import _error from '../error/_error';
import accounts from './accounts';
import prisma from './prisma';

/**
Manages life cycle of magic links.

Magic links permit executing various restricted access for
a given actor: e.g. unsubscribing from a mailing list.
*/
export class Magic {
  static actions = {
    UNSUBSCRIBE: 'unsubscribe',
    SUBSCRIBE: 'subscribe',
  };

  constructor() {}

  // TODO: remove async (unnecessary promise)
  async unsubscribeUrl(appUrl: string, magicLink: { code: string }) {
    return `${appUrl}/unsubscribe?code=${magicLink.code}`;
  }

  async createUnsubscribe(actorId: number) {
    const existingLink = await prisma.magicCode.findFirst({
      where: {
        actorId,
        expiresAt: null,
        resolvedAt: null,
        action: Magic.actions.UNSUBSCRIBE,
      },
    });
    if (existingLink) {
      return existingLink;
    }
    return await prisma.magicCode.create({
      data: {
        actorId,
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        code: shared.lib.otp.generate(),
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        issuedAt: shared.db.time.now(),
        /**
          According to the CAN SPAM guidelines
          https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business
          unsubscribe links have to be active for at least 30 days.

          But according to us and the internet, there is no reason to make these links expire
          https://security.stackexchange.com/questions/115964/email-unsubscribe-handling-security
        */
        expiresAt: null,
        action: Magic.actions.UNSUBSCRIBE,
      },
    });
  }

  async createSubscribe(actorId: number) {
    const existingLink = await prisma.magicCode.findFirst({
      where: {
        actorId,
        expiresAt: null,
        resolvedAt: null,
        action: Magic.actions.SUBSCRIBE,
      },
    });
    if (existingLink) {
      return existingLink;
    }
    return await prisma.magicCode.create({
      data: {
        actorId,
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        code: shared.lib.otp.generate(),
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'shared'.
        issuedAt: shared.db.time.now(),
        /*
          It's ok to never expire these - as long as they don't log you in.
        */
        expiresAt: null,
        action: Magic.actions.SUBSCRIBE,
      },
    });
  }

  magicLinkByCode(code: string) {
    return prisma.magicCode.findUnique({ where: { code } });
  }

  async tryToResolveMagicLink(request: MagicCode, expectedAction: string) {
    if (request.action != expectedAction) {
      return { error: _error.code.MAGIC_CODE_INVALID_ACTION };
    }
    switch (request.action) {
      case Magic.actions.UNSUBSCRIBE:
        return await this.unsubscribe(request);
      case Magic.actions.SUBSCRIBE:
        return await this.subscribe(request);
      default:
        return { error: _error.code.MAGIC_CODE_INVALID_ACTION };
    }
  }

  tryToUnsubscribe(request: MagicCode) {
    return this.tryToResolveMagicLink(request, Magic.actions.UNSUBSCRIBE);
  }

  tryToSubscribe(request: MagicCode) {
    return this.tryToResolveMagicLink(request, Magic.actions.SUBSCRIBE);
  }

  // Private
  async unsubscribe(request: MagicCode) {
    const validation = await this.requireActor(request);
    if (validation.error) {
      return validation;
    }
    // Usually we'd want to mark the magic link as expired in a transaction,
    // but there is no reason to invalidate unsubscribe links.
    // https://security.stackexchange.com/questions/115964/email-unsubscribe-handling-security
    await accounts.newsletterUnsubscribe(request.actorId);
    return {};
  }

  async subscribe(request: MagicCode) {
    const validation = await this.requireActor(request);
    if (validation.error) {
      return validation;
    }
    await accounts.newsletterSubscribe(request.actorId);
    return {};
  }

  async requireActor(request: MagicCode) {
    const actorId = request.actorId;
    const actor = await prisma.actor.findUnique({ where: { id: actorId } });
    if (!actor) {
      return { error: _error.code.NO_SUCH_ACTOR };
    }
    return {};
  }
}

export default new Magic();
