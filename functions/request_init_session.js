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

  await lib.init()
  const middleware = await lib.util.middleware.init()
  await middleware.run(event, context)
  context.params.email = util.args.consolidateEmailString(context.params.email)

  if(!context.user) {
    return await util.http.fail(callback, "This email address is not associated with an account.", {invalidEmail: true})
  }

  const loginRequest = await accounts.createLoginRequest(context.user)
  const logInUrl = await accounts.getLoginUrl(lib.util.env.appUrl(event, context), loginRequest)

  await lib.email.account.sendLoginOtpEmail(params.email, context.user.first_name, logInUrl)
  return await util.http.succeed(callback, {});
}
