/**
Manages life cycle of magic links.

Magic links permit executing various restricted access for
a given actor: e.g. unsubscribing from a mailing list.
*/
class Magic {
  constructor() {
  }

  async unsubscribeUrl(appUrl, magicLink) {
    return `${appUrl}/unsubscribe?otp=${magicLink.otp}&mlid=${magicLink.id}`
  }

  async createUnsubscribe(actorId) {
    const existingLink = await shared.db.pg.massive.magic_codes.findOne({
      actor_id: actorId,
      expires_at: null,
      resolved_at: null,
      action: Magic.actions.UNSUBSCRIBE
    })
    if(existingLink) {
      return existingLink
    }
    const request = {
      actor_id: actorId,
      code: shared.lib.otp.generate(),
      issued_at: shared.db.time.now(),
      /**
        According to the CAN SPAM guidelines
        https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business
        unsubscribe links have to be active for at least 30 days.

        But according to us and the internet, there is no reason to make these links expire
        https://security.stackexchange.com/questions/115964/email-unsubscribe-handling-security
      */
      expires_at: null,
      action: Magic.actions.UNSUBSCRIBE
    }
    return await shared.db.pg.massive.magic_codes.insert(request)
  }

  async createSubscribe(actorId) {
    const existingLink = await shared.db.pg.massive.magic_codes.findOne({
      actor_id: actorId,
      expires_at: null,
      resolved_at: null,
      action: Magic.actions.SUBSCRIBE
    })
    if(existingLink) {
      return existingLink
    }
    const request = {
      actor_id: actorId,
      code: shared.lib.otp.generate(),
      issued_at: shared.db.time.now(),
      /*
        It's ok to never expire these - as long as they don't log you in.
      */
      expires_at: null,
      action: Magic.actions.SUBSCRIBE
    }
    return await shared.db.pg.massive.magic_codes.insert(request)
  }

  async magicLinkById(magicLinkId) {
    return await shared.db.pg.massive.magic_codes.find(magicLinkId)
  }

  async tryToResolveMagicLink(request, otp, expectedAction) {
    if(request.action != expectedAction) {
      return { error: shared.error.code.MAGIC_LINK_INVALID_ACTION }
    }
    const verification = shared.lib.otp.verify(request, otp)
    if(verification.error != null) {
      return verification
    }
    switch(request.action) {
      case Magic.actions.UNSUBSCRIBE:
        return await this.unsubscribe(request, otp)
      case Magic.actions.SUBSCRIBE:
        return await this.subscribe(request, otp)
      default:
        return { error: shared.error.code.MAGIC_LINK_INVALID_ACTION }
    }
  }

  async tryToUnsubscribe(request, otp) {
    return await this.tryToResolveMagicLink(request, otp, Magic.actions.UNSUBSCRIBE)
  }

  async tryToSubscribe(request, otp) {
    return await this.tryToResolveMagicLink(request, otp, Magic.actions.SUBSCRIBE)
  }

  // Private
  async unsubscribe(request, otp) {
    const validation = await this.requireActor(request)
    if(validation.error) {
      return validation
    }
    // Usually we'd want to mark the magic link as expired in a transaction,
    // but there is no reason to invalidate unsubscribe links.
    // https://security.stackexchange.com/questions/115964/email-unsubscribe-handling-security
    await shared.db.accounts.newsletterUnsubscribe(request.actor_id)
    return { }
  }

  async subscribe(request, otp) {
    const validation = await this.requireActor(request)
    if(validation.error) {
      return validation
    }
    await shared.db.accounts.newsletterSubscribe(request.actor_id)
    return { }
  }

  async requireActor(request) {
    const actorId = request.actor_id
    const actor = await shared.db.pg.massive.actors.find(actorId)
    if(!actor) {
        return { error : shared.error.code.NO_SUCH_ACTOR }
    }
    return { }
  }
}

Magic.actions = {
  UNSUBSCRIBE: "unsubscribe",
  SUBSCRIBE: "subscribe",
}

module.exports = new Magic()
