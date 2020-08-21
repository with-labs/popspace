const lib = require("lib");
lib.util.env.init(require("./env.json"))

const handleAccountCreateFailure = (errorCode, callback) => {
  switch(errorCode) {
    case lib.db.ErrorCodes.otp.INVALID_OTP:
      return util.http.fail(callback, "Invalid one-time passcode.");
    case lib.db.ErrorCodes.otp.EXPIRED_OTP:
      return util.http.fail(callback, "Sorry, this link has expired. Please sign up again.");
    case lib.db.ErrorCodes.otp.RESOLVED_OTP:
      return util.http.fail(callback, "It seems this email is already registered! Please log in.");
    case lib.db.ErrorCodes.otp.UNEXPECTER_ERROR:
      // TODO: ERROR_LOGGING
      return util.http.fail(callback, "An unexpected error happened. Please try again.");
    default:
      return util.http.fail(callback, "An unexpected error happened. Please try again.");
  }
}

/**
 * Checks whether the specified one-time passcode matches the provided email,
 * and if it does - creates a new account and initiates a session.
 * Returns the session string, which can be stored on the front end for
 * future authorization.
 */
module.exports.handler = async (event, context, callback) => {
  if(util.http.failUnlessPost(event, callback)) return;

  const params = JSON.parse(event.body)
  params.email = params.email.trim()

  const accounts = new lib.db.Accounts()
  await accounts.init()

  const otp = params.otp;
  const email = params.email;

  const result = await accounts.tryToResolveAccountCreateRequest(email, otp)
  if(result.error != null) {
    return handleAccountCreateFailure(result.error, callback)
  }

  const userId = result.newUser.id
  const rooms = new lib.db.Rooms()
  await rooms.init()
  await rooms.generateRoom(userId)

  const session = await accounts.createSession(userId);
  const token = accounts.tokenFromSession(session)

  await accounts.cleanup()
  await rooms.cleanup()
  util.http.succeed(callback, {token: token});
}
