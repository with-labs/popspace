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
module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const email = shared.lib.args.consolidateEmailString(context.params.email)
  const user = await shared.db.accounts.userByEmail(email)

  if(!user) {
    return await util.http.fail(
      callback,
      "This email address is not associated with an account.",
      { errorCode: shared.error.code.UNAUTHORIZED }
    )
  }

  const loginRequest = await shared.db.accounts.createLoginRequest(user)
  const logInUrl = await shared.db.accounts.getLoginUrl(lib.util.env.appUrl(event, context), loginRequest)

  await lib.email.account.sendLoginOtpEmail(email, logInUrl)
  return await util.http.succeed(callback, {});
})
