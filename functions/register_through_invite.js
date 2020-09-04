const lib = require("lib");
lib.util.env.init(require("./env.json"))


const tryToSetUpNewAccount = async (params, accounts) => {
  let existingAccountCreateRequest = await accounts.getLatestAccountCreateRequest(params.email)
  if(existingAccountCreateRequest) {
    const resolve = await accounts.tryToResolveAccountCreateRequest(existingAccountCreateRequest, existingAccountCreateRequest.otp)
    if(!resolve.error) {
      return resolve
    }
  }
  const createRequest = await accounts.tryToCreateAccountRequest(params)
  return await accounts.tryToResolveAccountCreateRequest(createRequest, createRequest.otp)
}

/**
 * Finalizes the registration process for someone who clicked a room invite link
 * without previously having registered with us.
 * They'll have to provide account details like name/last name.
 * This will create an account_create_request, resolve it, and resolve the invite,
 * and return a session.
 */
module.exports.handler = async (event, context, callback) => {
  // We only care about POSTs with body data
  if(lib.util.http.failUnlessPost(event, callback)) return;

  await lib.init()

  const body = JSON.parse(event.body)
  const params = body.data
  const otp = body.otp
  const inviteId = body.inviteId
  const sessionToken = body.token

  params.email = util.args.consolidateEmailString(params.email)

  const rooms = new lib.db.Rooms()
  const invite = await rooms.inviteById(inviteId)
  if(!invite) {
    return await lib.util.http.fail(callback, "Invalid room invitation")
  }
  const verification = rooms.isValidInvitation(invite, params.email, otp)
  if(verification.error) {
    // refuse to create user if the invitation is not valid
    return await lib.db.otp.handleAuthFailure(verification.error, callback)
  }

  const accounts = new lib.db.Accounts()
  let user = null
  const existingUser = await accounts.userByEmail(params.email)
  if(existingUser) {
    // This is a registration endpoint, so something must have gone wrong if we hit this.
    // However, if the invite OTP is correct, if verifies access of the caller to the email.
    // That means we don't have to fail, we can just create a new session.
    user = existingUser
  } else {
    // Make sure to create the user before resolving the invitation
    const accountCreate = await tryToSetUpNewAccount(params, accounts)
    if(accountCreate.error != null)  {
      return await lib.db.otp.handleAuthFailure(accountCreate.error, callback)
    }
    user = accountCreate.newUser
  }

  const resolve = await rooms.resolveInvitation(invite, user, otp)
  if(resolve.error) {
    return await lib.db.otp.handleAuthFailure(resolve.error, callback)
  }

  const response = {}
  const shouldIssueToken = await accounts.needsNewSessionToken(sessionToken, user)
  if(shouldIssueToken) {
    const session = await accounts.createSession(user.id)
    response.newSessionToken = accounts.tokenFromSession(session)
  }

  const room = await rooms.roomById(invite.room_id)
  response.roomName = room.name || room.unique_id

  return await lib.util.http.succeed(callback, response);
}
