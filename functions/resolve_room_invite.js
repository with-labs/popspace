const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Checks whether the specified one-time passcode matches the provided room invite,
 * and if it does - resolves a room invite
 * Further, checks whether the provided session is valid, and whether the user
 * matches the invite user. Issues a new session if necessary.
 */
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const params = context.params
  const otp = params.otp
  const inviteId = params.inviteId
  let sessionToken = params.token

  const invite = await shared.db.room.invites.inviteById(inviteId)
  if(!invite) {
    return await lib.util.http.fail(
      callback,
      "Invalid room invitation",
      { errorCode: shared.error.code.INVALID_INVITE }
    )
  }
  let user = await shared.db.accounts.userByEmail(invite.email)

  if(!user) {
    // We should never hit this if everything is working
    // (as long as people are using the site correctly).
    // We should check whether the user exists before calling this endpoint.
    return await lib.util.http.fail(
      callback,
      "Unknown email. Please sign up.",
      { errorCode: shared.error.code.JOIN_FAIL_NO_SUCH_USER }
    )
  }

  const resolve = await shared.db.room.invites.resolveInvitation(invite, user, otp)

  const result = {}
  const shouldRenewToken = await shared.db.accounts.needsNewSessionToken(sessionToken, user)
  const roomNameEntry = await shared.db.rooms.preferredNameById(invite.room_id)
  result.roomName = roomNameEntry.name

  if(resolve.error) {
    // If we can't resolve - but it's a valid invite and the user is a member -
    // we can let them through into the room anyway if they have the OTP
    if(resolve.error == shared.error.code.RESOLVED_OTP && invite.otp == otp) {
      const hasAccess = await shared.db.room.memberships.hasAccess(user.id, invite.room_id)
      if(hasAccess && !shouldRenewToken) {
        // Don't allow the link to function as an un-expiring log in link -
        // only pass them through with a valid token.
        return await util.http.succeed(callback, result)
      } else {
        return await util.http.authFail(resolve.error, callback)
      }
    } else {
      return await util.http.authFail(resolve.error, callback)
    }
  }

  if(shouldRenewToken) {
    const session = await shared.db.accounts.createSession(user.id)
    sessionToken = shared.db.accounts.tokenFromSession(session)
    result.newSessionToken = sessionToken
  }

  return await util.http.succeed(callback, result)
})
