const lib = require("lib");
lib.util.env.init(require("./env.json"))

/**
 * Checks whether the specified one-time passcode matches the provided room claim,
 * and if it does - resolves a room claim
 * Further, checks whether the provided session is valid, and whether the user
 * matches the claim user. Issues a new session if necessary.
 */
module.exports.handler = async (event, context, callback) => {
  if(util.http.failUnlessPost(event, callback)) return;

  await lib.init()

  const params = JSON.parse(event.body)
  const otp = params.otp
  const claimId = params.claimId
  let sessionToken = params.token

  const rooms = new lib.db.Rooms()
  const claim = await db.pg.massive.room_claims.findOne({id: claimId})

  if(!claim) {
    return await lib.util.http.fail(callback, "Invalid room invitation")
  }

  const accounts = new lib.db.Accounts()
  let user = await accounts.userByEmail(claim.email)

  if(!user) {
    // We should never hit this if everything is working
    // (as long as people are using the site correctly).
    // We should check whether the user exists before calling this endpoint.
    return await lib.util.http.fail(
      callback,
      "Unknown email. Please sign up.",
      { errorCode: util.http.ERRORS.rooms.JOIN_FAIL_NO_SUCH_USER }
    )
  }

  const resolve = await rooms.resolveClaim(claim, user, otp)

  const result = {}
  const shouldRenewToken = await accounts.needsNewSessionToken(sessionToken, user)
  const roomNameEntry = await rooms.preferredNameById(claim.room_id)
  result.roomName = roomNameEntry.name

  if(resolve.error) {
    // If we can't resolve - but it's a valid claim and the user is a member -
    // we can let them through into the room anyway if they have the OTP
    if(resolve.error == lib.db.ErrorCodes.otp.RESOLVED_OTP && claim.otp == otp) {
      const alreadyMember = await rooms.isMember(user.id, claim.room_id)
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
    const session = await accounts.createSession(user.id)
    sessionToken = accounts.tokenFromSession(session)
    result.newSessionToken = sessionToken
  }

  return await util.http.succeed(callback, result)
}
