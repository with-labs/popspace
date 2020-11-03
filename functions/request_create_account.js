const lib = require("lib");
lib.util.env.init(require("./env.json"))

/*
Sign up flow

1. Generate URL-safe OTP
2. Store account create request
3. Send email with OTP link
4. If OTP link is opened, a resolve_create_account endpoint is called with the email+OTP parsed out of the link
5. Create/store session
*/


module.exports.handler = util.netlify.postEndpoint(async (event, context, callback) => {
  const params = context.params

  // Make sure we don't distinguish emails just by whitespace
  params.email = util.args.consolidateEmailString(params.email)
  const existingUser = await db.accounts.userByEmail(params.email)

  if(existingUser) {
    return await lib.util.http.fail(
      callback,
      "Email already registered. Please log in!",
      { errorCode: lib.db.ErrorCodes.user.ALREADY_REGISTERED }
    )
  }

  const existingCreateRequest = await db.accounts.getLatestAccountCreateRequest(params.email)

  if(existingCreateRequest) {
    if(!lib.db.otp.isExpired(existingCreateRequest)) {
      return await lib.util.http.fail(
        callback,
        "Email already registered. Check your email for a verification link.",
        { errorCode: lib.db.ErrorCodes.user.ALREADY_REGISTERED }
      )
    }
  }

  const createRequest = await db.accounts.tryToCreateAccountRequest(params)
  const signupUrl = db.accounts.getSignupUrl(lib.util.env.appUrl(event, context), createRequest)
  await lib.email.account.sendSignupOtpEmail(params.email, params.firstName, signupUrl)

  return await lib.util.http.succeed(callback, {});
})
