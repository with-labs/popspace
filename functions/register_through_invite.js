const lib = require("lib");
lib.util.env.init(require("./env.json"))

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

  const body = JSON.parse(event.body)
  const params = body.data
  const otp = body.otp
  const inviteId = body.inviteId

  const rooms = new lib.db.Rooms()
  await rooms.init()

  const invite = await rooms.inviteById(inviteId)

  if(!invite) {
    return lib.util.http.fail(callback, "Invalid room invitation")
  }



  const accounts = new lib.db.Accounts()
  await accounts.init()

  // Make sure we don't distinguish emails just by whitespace
  params.email = params.trim()
  const existingUser = await accounts.userByEmail(params.email)

  if(existingUser) {
    // TODO: just create a new session
    return lib.util.http.fail(callback, "Email already registered. Please log in!")
  }



  const accounts = new lib.db.Accounts()
  await accounts.init()

  let user = accounts.userByEmail(invite.email)

  if(!user) {
    // We should never hit this if everything is working
    // (as long as people are using the site correctly).
    // We should check whether the user exists before calling this endpoint.
    return lib.util.http.fail(callback, "Unknown email. Please sign up.")
  }

  const resolve = await rooms.resolveInvitation(invite, user, otp)
  if(resolve.error) {
    return lib.db.otp.handleAuthFailure(resolve.error, callback)
  }

  const result = {}
  if(!sessionToken || invitedUserDifferentFromSessionUser(sessionToken, user)) {
    const session = await accounts.createSession()
    sessionToken = accounts.tokenFromSession(session)
    result.newSessionToken = sessionToken
  }









  const existingCreateRequest = await accounts.getLatestAccountCreateRequest(params.email)

  if(existingCreateRequest) {
    // TODO: resolve
    if(!lib.db.otp.isExpired(existingCreateRequest)) {
      return lib.util.http.fail(callback, "Email already registered. Check your email for a verification link.")
    }
  }

  const createRequest = await accounts.createAccountRequest({
    first_name: params.firstName,
    last_name: params.lastName,
    display_name: `${params.firstName} ${params.lastName}`,
    email: params.email,
    newsletter_opt_in: params.receiveMarketing
  })

  const signupUrl = accounts.getSignupUrl(lib.util.env.appUrl(event, context), createRequest)

  await lib.email.account.sendSignupOtpEmail(params.email, params.firstName, signupUrl)

  await accounts.cleanup()
  return lib.util.http.succeed(callback, {});
}
