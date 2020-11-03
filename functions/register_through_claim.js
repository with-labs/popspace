/**
  NOTE: this is a temporary endpoint that should be live during the
  migration from Alpha.

  It's very similar to the register_through_invite route, but
  instead of becoming a member of a room, the room ownership is transfered
  to the registering user.

  Once all claims have been resolved, we should drop the claims table, and
  delete this route.

  Otherwise, if we have reason to keep it around, we may want to consolidate
  the logic with the invite logic.
  ~ Alexey, 09/16/2020, year of the COVID19 apocalypse.
*/

const lib = require("lib");
lib.util.env.init(require("./env.json"))


const tryToSetUpNewAccount = async (params) => {
  let existingAccountCreateRequest = await db.accounts.getLatestAccountCreateRequest(params.email)
  if(existingAccountCreateRequest) {
    const resolve = await db.accounts.tryToResolveAccountCreateRequest(existingAccountCreateRequest, existingAccountCreateRequest.otp)
    if(!resolve.error) {
      return resolve
    }
  }
  const createRequest = await db.accounts.tryToCreateAccountRequest(params)
  return await db.accounts.tryToResolveAccountCreateRequest(createRequest, createRequest.otp)
}

/**
 * Finalizes the registration process for someone who clicked a room invite link
 * without previously having registered with us.
 * They'll have to provide account details like name/last name.
 * This will create an account_create_request, resolve it, and resolve the invite,
 * and return a session.
 */
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {

  const body = context.params
  const params = body.data
  const otp = body.otp
  const claimId = body.claimId
  const sessionToken = body.token

  params.email = util.args.consolidateEmailString(params.email)

  const claim = await db.pg.massive.room_claims.findOne({id: claimId})
  if(!claim) {
    return await lib.util.http.fail(
      callback,
      "Invalid room claim",
      { errorCode: lib.db.ErrorCodes.room.INVALID_ROOM_CLAIM }
    )
  }

  // claims have the exact same verification logic as invites
  const verification = db.rooms.isValidInvitation(claim, params.email, otp)
  if(verification.error) {
    // refuse to create user if the invitation is not valid
    return await lib.db.otp.handleAuthFailure(verification.error, callback)
  }

  let user = null
  const existingUser = await db.accounts.userByEmail(params.email)
  if(existingUser) {
    // This is a registration endpoint, so something must have gone wrong if we hit this.
    // However, if the invite OTP is correct, if verifies access of the caller to the email.
    // That means we don't have to fail, we can just create a new session.
    user = existingUser
  } else {
    // Make sure to create the user before resolving the invitation
    const accountCreate = await tryToSetUpNewAccount(params)
    if(accountCreate.error != null)  {
      return await lib.db.otp.handleAuthFailure(accountCreate.error, callback)
    }
    user = accountCreate.newUser
    // In the invite proces, we generate a room here
    // For claims it's not necessary: they'll get the claimed room
  }

  const resolve = await db.rooms.resolveClaim(claim, user, otp)
  if(resolve.error) {
    return await lib.db.otp.handleAuthFailure(resolve.error, callback)
  }

  const response = {}
  const shouldIssueToken = await db.accounts.needsNewSessionToken(sessionToken, user)
  if(shouldIssueToken) {
    const session = await db.accounts.createSession(user.id)
    response.newSessionToken = db.accounts.tokenFromSession(session)
  }

  const roomNameEntry = await db.rooms.preferredNameById(claim.room_id)
  response.roomName = roomNameEntry.name

  return await lib.util.http.succeed(callback, response);
})
