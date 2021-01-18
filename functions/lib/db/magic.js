const DbAccess = require("./pg/db_access")

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
    const existingLink = await db.pg.massive.magic_links.findOne({
      user_id: userId,
      expires_at: null,
      resolved_at: null,
      action: Magic.actions.UNSUBSCRIBE
    })
    if(existingLink) {
      return existingLink
    }
    const request = {
      user_id: userId,
      otp: lib.db.otp.generate(),
      issued_at: this.now(),
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
    // Usually we'd want to mark the magic link as expired in a transaction,
    // but there is no reason to invalidate unsubscribe links.
    // https://security.stackexchange.com/questions/115964/email-unsubscribe-handling-security
    await lib.db.pg.massive.users.update({id: userId}, {newsletter_opt_in: false})
    return { }
  }
}

Magic.actions = {
  UNSUBSCRIBE: "unsubscribe"
}

module.exports = Magic
