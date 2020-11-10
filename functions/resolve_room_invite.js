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

  const invite = await db.rooms.inviteById(inviteId)
  if(!invite) {
    return await lib.util.http.fail(
      callback,
      "Invalid room invitation",
      { errorCode: lib.db.ErrorCodes.room.INVALID_INVITE }
    )
  }
  let user = await db.accounts.userByEmail(invite.email)

  if(!user) {
    // We should never hit this if everything is working
    // (as long as people are using the site correctly).
    // We should check whether the user exists before calling this endpoint.
    return await lib.util.http.fail(
      callback,
      "Unknown email. Please sign up.",
      { errorCode: lib.db.ErrorCodes.room.JOIN_FAIL_NO_SUCH_USER }
    )
  }

  const resolve = await db.rooms.resolveInvitation(invite, user, otp)

  const result = {}
  const shouldRenewToken = await db.accounts.needsNewSessionToken(sessionToken, user)
  const roomNameEntry = await db.rooms.preferredNameById(invite.room_id)
  result.roomName = roomNameEntry.name

  if(resolve.error) {
    // If we can't resolve - but it's a valid invite and the user is a member -
    // we can let them through into the room anyway if they have the OTP
    if(resolve.error == lib.db.ErrorCodes.otp.RESOLVED_OTP && invite.otp == otp) {
      const alreadyMember = await db.rooms.isMember(user.id, invite.room_id)
      if(alreadyMember && !shouldRenewToken) {
        // Don't allow the link to function as an un-expiring log in link -
        // only pass them through with a valid token.
        return await util.http.succeed(callback, result)
      } else {
        return await lib.db.otp.handleAuthFailure(resolve.error, callback)
      }
    } else {
      return await lib.db.otp.handleAuthFailure(resolve.error, callback)
    }
  }

  if(shouldRenewToken) {
    const session = await db.accounts.createSession(user.id)
    sessionToken = db.accounts.tokenFromSession(session)
    result.newSessionToken = sessionToken
  }

  return await util.http.succeed(callback, result)
})
