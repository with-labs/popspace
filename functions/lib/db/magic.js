const DbAccess = require("./pg/db_access")

/**
  According to the CAN SPAM guidelines
  https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business
  unsubscribe links have to be active for at least 30 days.
*/
const UNSUBSCRIBE_LINK_EXPIRATION_DAYS = 31;

/**
Manages life cycle of magic links.

Magic links permit executing various restricted access for
a given user account: e.g. unsubscribing from a mailing list.
*/
class Magic extends DbAccess {
  constructor() {
    super()
  }

  async unsubscribeUrl(appUrl, magicLink) {
    return `${appUrl}/unsubscribe?otp=${magicLink.otp}&mlid=${magicLink.id}`
  }

  async createUnsubscribe(userId) {
    const request = {
      user_id: userId,
      otp: lib.db.otp.generate(),
      issued_at: this.now(),
      expires_at: lib.db.otp.expirationInNDays(UNSUBSCRIBE_LINK_EXPIRATION_DAYS),
      action: Magic.actions.UNSUBSCRIBE
    }
    return await db.pg.massive.magic_links.insert(request)
  }

  async magicLinkById(magicLinkId) {
    return await db.pg.massive.magic_links.find(magicLinkId)
  }

  async tryToResolveMagicLink(request, otp) {
    const verification = lib.db.otp.verify(request, otp)
    if(verification.error != null) {
      return verification
    }
    switch(request.action) {
      case Magic.actions.UNSUBSCRIBE:
        return await this.unsubscribe(request, otp)
        break;
      default:
        return { error: lib.db.ErrorCodes.otp.INVALID_ACTION }
    }
  }

  async tryToUnsubscribe(request, otp) {
    if(request.action != Magic.actions.UNSUBSCRIBE) {
      return { error: lib.db.ErrorCodes.otp.INVALID_ACTION }
    }
    return await this.tryToResolveMagicLink(request, otp)
  }

  // Private
  async unsubscribe(request, otp) {
    const userId = request.user_id
    const user = await db.pg.massive.users.find(userId)
    if(!user) {
        return { error : lib.db.ErrorCodes.user.NO_SUCH_USER }
    }
    const result = await db.pg.massive.withTransaction(async (tx) => {
      await tx.users.update({id: userId}, {newsletter_opt_in: false})
      return await tx.magic_links.update({id: request.id}, {resolved_at: this.now})
    })
    return { }
  }
}

Magic.actions = {
  UNSUBSCRIBE: "unsubscribe"
}

module.exports = Magic
