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


module.exports.handler = async (event, context, callback) => {
  // We only care about POSTs with body data
  if(lib.util.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  const accounts = new lib.db.Accounts(params)
  await accounts.init()

  // Make sure we don't distinguish emails just by whitespace
  params.email = params.email.trim()
  const existingUser = await accounts.userByEmail(params.email)

  if(existingUser) {
    return lib.util.http.fail(callback, "Email already registered. Please log in!")
  }

  const existingCreateRequest = await accounts.getLatestAccountCreateRequest(params.email)

  if(existingCreateRequest) {
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
