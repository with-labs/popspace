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
  const inviteId = body.inviteId
  const sessionToken = body.token

  params.email = util.args.consolidateEmailString(params.email)

  const invite = await db.rooms.inviteById(inviteId)
  if(!invite) {
    return await lib.util.http.fail(
      callback,
      "Invalid room invitation",
      { errorCode: lib.db.ErrorCodes.room.INVALID_INVITE }
    )
  }
  const verification = db.rooms.isValidInvitation(invite, params.email, otp)
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
    await db.rooms.generateRoom(user.id)
  }

  const resolve = await db.rooms.resolveInvitation(invite, user, otp)
  if(resolve.error) {
    return await lib.db.otp.handleAuthFailure(resolve.error, callback)
  }

  const response = {}
  const shouldIssueToken = await db.accounts.needsNewSessionToken(sessionToken, user)
  if(shouldIssueToken) {
    const session = await db.accounts.createSession(user.id)
    response.newSessionToken = db.accounts.tokenFromSession(session)
  }

  const roomNameEntry = await db.rooms.preferredNameById(invite.room_id)
  response.roomName = roomNameEntry.name

  return await lib.util.http.succeed(callback, response);
})
