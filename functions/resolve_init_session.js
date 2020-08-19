const lib = require("lib");
lib.util.env.init(require("./env.json"))

const handleAccountCreateFailure = (errorCode, callback) => {
  switch(errorCode) {
    case lib.db.ErrorCodes.otp.INVALID_OTP:
      return util.http.fail(callback, "Invalid one-time passcode.");
    case lib.db.ErrorCodes.otp.EXPIRED_OTP:
      return util.http.fail(callback, "Sorry, this link has expired. Please sign up again.");
    case lib.db.ErrorCodes.otp.RESOLVED_OTP:
      return util.http.fail(callback, "It seems this link has already been used to log in. Please try again.");
    case lib.db.ErrorCodes.otp.UNEXPECTER_ERROR:
      // TODO: ERROR_LOGGING
      return util.http.fail(callback, "An unexpected error happened. Please try again.");
    default:
      return util.http.fail(callback, "An unexpected error happened. Please try again.");
  }
}

module.exports.handler = async (event, context, callback) => {
  if(util.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  const accounts = new lib.db.Accounts()
  await accounts.init()

  const otp = params.otp;
  const uid = params.uid;

  const result = await accounts.resolveLoginRequest(uid, otp)
  if(result.error != null) {
    return handleAccountCreateFailure(result.error, callback)
  }

  const session = result.session
  const token = accounts.tokenFromSession(session)

  await accounts.cleanup()
  util.http.succeed(callback, {token: token});
}
