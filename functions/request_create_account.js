const lib = require("lib")
lib.util.env.init(require("./env.json"))

/*
Sign up flow

1. Generate URL-safe OTP
2. Store account create request
3. Send email with OTP link
4. If OTP link is opened, a resolve_create_account endpoint is called with the email+OTP parsed out of the link
5. Create/store session
*/

module.exports.handler = util.netlify.postEndpoint(
  async (event, context, callback) => {
    const params = context.params

    // Make sure we don't distinguish emails just by whitespace
    params.email = shared.lib.args.consolidateEmailString(params.email)
    const existingUser = await shared.db.accounts.userByEmail(params.email)

    if (existingUser) {
      return await lib.util.http.fail(
        callback,
        "Email already registered. Please log in!",
        { errorCode: shared.error.code.ALREADY_REGISTERED }
      )
    }

    const existingCreateRequest = await shared.db.accounts.getLatestAccountCreateRequest(
      params.email
    )

    const createRequest =
      existingCreateRequest ||
      (await shared.db.accounts.tryToCreateAccountRequest(params))
    const signupUrl = shared.db.accounts.getSignupUrl(
      lib.util.env.appUrl(event, context),
      createRequest
    )
    await lib.email.account.sendSignupOtpEmail(params.email, signupUrl)

    return await lib.util.http.succeed(callback, {})
  }
)
