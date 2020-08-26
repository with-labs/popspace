const lib = require("lib");
lib.util.env.init(require("./env.json"))


/*
Log in flow

1. Check whether email is registered
2. Generate URL-safe OTP
3. Store login request (email, otp)
4. Send email with OTP link
5. If OTP link is opened, an resolve_init_session endpoint is called with the email+OTP parsed out of the link
6. Create/store session

*/

/**
 * Send a magic link to the provided email which will initiate a session.
 */
module.exports.handler = async (event, context, callback) => {
  // We only care about POSTs with body data
  if(util.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  params.email = params.email.trim()

  const accounts = new lib.db.Accounts()
  await accounts.init()

  const user = await accounts.userByEmail(params.email)
  if(!user) {
    return util.http.fail(callback, "Unknown email", {invalidEmail: true})
  }

  const loginRequest = await accounts.createLoginRequest(user)
  const logInUrl = await accounts.getLoginUrl(lib.util.env.appUrl(event, context), loginRequest)

  await lib.email.signup.sendLoginOtpEmail(params.email, params.firstName, logInUrl)

  await accounts.cleanup()
  util.http.succeed(callback, {});
}
