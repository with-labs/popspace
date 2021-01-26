
const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Checks whether the specified one-time passcode matches the provided room claim,
 * and if it does - resolves a room claim
 * Further, checks whether the provided session is valid, and whether the user
 * matches the claim user. Issues a new session if necessary.
 */
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const params = context.params
  const otp = params.otp
  const claimId = params.claimId
  let sessionToken = params.token

  const claim = await shared.db.pg.massive.room_claims.findOne({id: claimId})
  if(!claim) {
    return await lib.util.http.fail(
      callback,
      "Invalid room claim",
      { errorCode: shared.error.code.INVALID_ROOM_CLAIM }
    )
  }
  let user = await shared.db.accounts.userByEmail(claim.email)

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

  const resolve = await shared.db.room.claims.resolveClaim(claim, user, otp)

  const result = {}
  const shouldRenewToken = await shared.db.accounts.needsNewSessionToken(sessionToken, user)
  const roomNameEntry = await shared.db.rooms.preferredNameById(claim.room_id)
  result.roomName = roomNameEntry.name

  if(resolve.error) {
    // If we can't resolve - but it's a valid claim and the user is a member -
    // we can let them through into the room anyway if they have the OTP
    if(resolve.error == shared.error.code.RESOLVED_OTP && claim.otp == otp) {
      const hasAccess = await shared.db.room.memberships.hasAccess(user.id, claim.room_id)
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
