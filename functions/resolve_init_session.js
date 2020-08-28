const lib = require("lib");
lib.util.env.init(require("./env.json"))

const handleLoginFailure = (errorCode, callback) => {
  switch(errorCode) {
    case lib.db.ErrorCodes.otp.INVALID_OTP:
      return util.http.fail(callback, "Invalid one-time passcode.");
    case lib.db.ErrorCodes.otp.EXPIRED_OTP:
      return util.http.fail(callback, "Sorry, this link has expired. Please sign up again.");
    case lib.db.ErrorCodes.otp.RESOLVED_OTP:
      return util.http.fail(callback, "It seems this link has already been used to log in. Please try again.");
    case lib.db.ErrorCodes.UNEXPECTER_ERROR:
      // TODO: ERROR_LOGGING
      return util.http.fail(callback, "An unexpected error happened. Please try again.");
    default:
      return util.http.fail(callback, "An unexpected error happened. Please try again.");
  }
}

/**
 * Checks whether the specified one-time passcode matches the provided email,
 * and if it does - initiates a session.
 * Returns the session string, which can be stored on the front end for
 * future authorization.
 */
module.exports.handler = async (event, context, callback) => {
  if(util.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  const accounts = new lib.db.Accounts()
  await accounts.init()

  const otp = params.otp;
  const uid = params.uid;

  const result = await accounts.resolveLoginRequest(uid, otp)
  if(result.error != null) {
    return handleLoginFailure(result.error, callback)
  }

  const session = result.session
  const token = accounts.tokenFromSession(session)

  await accounts.cleanup()
  util.http.succeed(callback, {token: token});
}
